---
title: "Building Hz, a Huffman Compressor for macOS"
date: "2026-07-20"
description: "How a small SwiftUI Huffman compressor grew into a systems programming project with a custom archive format, streaming, Rust, benchmarks, and research notes."
tags: ["Swift", "Rust", "Huffman Coding", "Systems Programming", "Benchmarks"]
readingTime: "8 min read"
tldr: "Hz started as a native macOS app for experimenting with Huffman compression. The interesting part quickly moved below the interface: archive design, bit-level I/O, streaming, native Rust integration, benchmarks, and the trade-offs that appear when a small utility starts behaving like a real system."
takeaways:
  - "A simple compression app became a cleaner project once the UI and compression engine were separated."
  - "Streaming changed the architecture by making memory usage part of the design instead of an afterthought."
  - "Benchmarks and written notes made the implementation easier to reason about than intuition alone."
featured: false
---

> **Source code:** [github.com/htaschne/hz](https://github.com/htaschne/hz)

I wanted to build a Huffman compressor.

That was the whole idea at first. Take a file, count the bytes, build a Huffman tree, write a smaller file, and then make sure the original file could come back out unchanged.

The project became **Hz**, a native macOS Huffman archiver built mostly to learn. It started as a SwiftUI desktop application, but the more I worked on it, the more obvious it became that the interface was only the visible part. The interesting questions were underneath: how should the archive be laid out, how should bits be packed, how much memory should compression use, and what happens if part of the engine moves into Rust?

What began as a small utility slowly turned into a playground for systems programming ideas.

## Huffman Coding

Huffman coding is one of those algorithms that feels simple and clever at the same time.

The compressor starts by counting how often each byte appears in the input. A text file might contain a lot of spaces, vowels, and repeated punctuation. A binary file might have a much flatter distribution. That frequency table tells the compressor which symbols are common and which are rare.

From there, the algorithm builds a tree. Frequent bytes end up closer to the root. Rare bytes end up deeper in the tree. Walking left or right through the tree gives each byte a bit pattern.

The useful trick is that the codes have variable length. A common byte might become something short like:

```text
e -> 011
```

while a rare byte might need more bits:

```text
z -> 11010110
```

No separator is needed between codes because the tree makes the encoding prefix-free. The decoder can read bits one at a time, walk the same tree, and emit a byte whenever it reaches a leaf.

That is the core of Hz. Count bytes, build a deterministic tree, encode through that tree, and store enough metadata so the decoder can rebuild the same structure later.

## Try The Frequency Table

Before there is a tree, there is just counting. Edit the text below and watch the weights change. Spaces are shown explicitly because a compressor sees them as real input too.

```huffman-frequency
```

The takeaway is simple: Huffman coding starts by asking which symbols are worth making cheap.

## Build The Tree

The tree is built by repeatedly combining the two lightest nodes. The new parent goes back into the queue, and the process continues until there is only one root.

```huffman-tree
```

That small loop is where the shape of the final codebook comes from.

## Walk The Codes

Once the tree exists, the codes fall out naturally. A left edge contributes `0`, a right edge contributes `1`, and the path from the root to a leaf becomes that character's code.

```huffman-codes
```

The code table is generated from the same tree shown above. Nothing is hardcoded separately.

## Encode The Text

The final step is replacing each input character with its generated Huffman code and appending those bits into the payload.

```huffman-encoding
```

This is also where a practical detail shows up: the payload can shrink while a tiny full archive still grows, because the decoder needs metadata such as the tree or frequency table.

## The First Version

The first version was a SwiftUI app. I wanted something native and simple: drag in a file, choose where to save the compressed archive, and then drag the archive back in to decompress it.

The early implementation lived mostly in Swift. There was a frequency table, a Huffman tree, a bit writer, a bit reader, and a codec tying them together. It was not fancy, but it worked, and that mattered. There is a very satisfying moment in compression projects where a file makes a full round trip:

```text
original file -> .hz archive -> original file
```

At that point the project also needed a file format. I did not want the archive to be a mystery blob that only the current code could understand. Hz archives use a versioned `.hz` format with a small header, the original byte count, the number of meaningful encoded bits, a sorted frequency table, and the packed Huffman payload.

The archive begins with a magic value:

```text
HZF1
```

That tiny detail makes the project feel more real. The decoder can reject files that are not Hz archives, check the format version, and avoid treating random bytes as compressed data.

## When Performance Became Interesting

The first working version loaded data into memory.

For small files, that is fine. It is also the simplest way to write the code: read the whole file into `Data`, compress it, return another `Data`, and let the app write the result.

But compression is naturally a file-oriented task, and files can be much larger than the examples used while testing. At some point, memory usage becomes part of the design.

Streaming pushed the architecture in a better direction. Instead of thinking of compression as one big transformation over a byte array, the engine starts to look like a pipeline:

```text
read chunk -> encode bits -> write chunk
```

Huffman coding has an interesting constraint here. To encode the payload, the compressor needs the frequency table first. That means ordinary Huffman compression cannot fully stream in one pass unless the format changes or the input is spooled somewhere else.

Hz handles this in the native streaming path with two bounded passes over seekable input. The first pass counts frequencies and determines the header fields. The second pass rereads the input and writes the encoded payload directly to the destination.

This was one of the points where the project stopped feeling like just an algorithm exercise. The algorithm was still the center, but the surrounding engineering choices started to matter just as much.

## Bringing Rust Into The Project

After the Swift implementation was working, I wanted to explore a Rust backend.

Part of that was curiosity. Rust is a good language for systems programming because it gives direct control over memory layout and I/O while still pushing hard against unsafe ownership mistakes. That combination is appealing for code that parses binary formats, packs bits, and crosses language boundaries.

The goal was not to prove that one language was better than another. Swift is still responsible for the desktop experience, file workflow, and application state. Rust handles the native compression engine.

The split made the architecture cleaner.

In Swift, compression sits behind a small abstraction:

```swift
protocol CompressionEngine {
    func compress(_ input: Data, options: CompressionOptions) throws -> CompressionResult
    func decompress(_ archive: Data, options: DecompressionOptions) throws -> Data
}
```

That interface made it possible to keep a Swift reference engine and add a Rust engine without rewriting the app around either one. The Swift side can ask for compression. The selected engine decides how to do it.

The Rust library is linked through a C ABI, which forced some useful discipline. Only C-compatible types cross the boundary. Swift owns its input memory. Rust owns returned output buffers until Swift copies and releases them. Error cases have to become explicit results.

None of that is glamorous, but it is exactly the kind of glue code that makes mixed-language systems interesting.

## Measuring Instead Of Guessing

Once there were multiple implementations, guessing became less useful.

It is tempting to assume which version will be faster, which workload will compress better, or how much streaming changes memory behavior. Those assumptions are often incomplete, so Hz grew a benchmark suite.

The runner can compare the Swift reference engine, the Rust in-memory backend, the Rust streaming path, and recursive compression modes. It also generates deterministic workloads with different byte distributions:

- repetitive text;
- prose-like text;
- high-entropy binary data;
- repeated single-byte data;
- compressed-like binary data.

Those workloads are important because compression performance is tied directly to input shape. A repetitive file and a high-entropy file exercise the compressor differently. The tree shape, output ratio, and metadata overhead all change.

I do not think the most useful part of the benchmark suite is a single number. The useful part is the habit it encourages: make a change, measure it, compare it against another implementation, and verify that decompression still returns the original bytes.

That last part matters. A fast compressor that cannot reliably round trip the input is not a compressor. It is a bug generator with good timing.

## Documentation And Research

Another unexpected part of Hz is how much writing it produced.

The repository includes documentation for the archive format, the native engine, and the streaming design. It also includes papers exploring recursive Huffman compression behavior and implementation benchmarks across Swift, Rust, and streaming modes.

Writing those documents made the software better.

The archive format document forced me to answer questions that code can otherwise hide. What is the byte order? How are padding bits handled? What makes an archive malformed? How does the decoder rebuild the tree?

The streaming design note captured boundaries that would be easy to forget later. Compression streams over seekable input. Decompression can work from non-seekable input. Recursive adaptive compression is still in-memory because it compares candidate archives before accepting a layer.

The benchmark paper pushed the project in a different way. It made the comparison between implementations more deliberate and reproducible.

Writing about software is almost as valuable as writing software. Code says what happens. Good notes explain why it happens that way.

## Looking Back

Hz taught me that architecture often evolves after the first useful version exists. I did not start with an engine abstraction because I wanted a beautiful architecture diagram. I started with a compressor. The abstraction became useful when there were two engines. The archive specification became useful when Swift and Rust both needed to agree on the same bytes. The benchmark suite became useful when performance questions stopped being hypothetical.

It also reinforced that profiling beats assumptions. Compression is full of trade-offs that sound obvious until they meet real workloads. A format field that feels small can matter on tiny inputs. A streaming path can improve memory behavior while adding its own overhead. Recursive compression can be interesting, but only if it is measured carefully instead of accepted on vibes.

The Swift and Rust split was also more pleasant than I expected. Swift gives the app a native macOS feel. Rust gives the lower-level engine a compact place to handle binary parsing, streaming, and FFI boundaries. The project became easier to reason about once each side had a clear job.

More than anything, Hz reminded me that small projects are allowed to grow naturally. Sometimes the best projects begin with a simple question and keep revealing better questions as they go.

## What Comes Next

Hz is still evolving.

There are plenty of directions that would be fun to explore: a better interface, additional compression algorithms, alternative archive formats, more benchmark workloads, and deeper research around recursive compression and streaming trade-offs.

I do not know which of those will become the next major part of the project. That is part of what makes it interesting.

For now, Hz is a Huffman compressor, a macOS app, a Swift and Rust interoperability experiment, and a reminder that even a small file format can teach a lot about systems programming.
