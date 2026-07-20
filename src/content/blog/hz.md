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

That was the entire plan.

Take a file, count the bytes, build a Huffman tree, write a smaller file, and make sure the original file comes back out unchanged. Small weekend-project energy.

Then it became **Hz**, a native macOS Huffman archiver, and the project kept growing into systems-programming territory.

It started as a SwiftUI app. The UI was supposed to be the project. After a while, the UI was mostly just the front door. The fun was underneath: archive layout, bit packing, memory usage, streaming, Rust, FFI, benchmarks, and a few research notes I absolutely did not expect to write when I started.

## Huffman Coding

Huffman coding felt like a good excuse to build a file compressor.

The compressor starts by counting bytes. Text usually has lots of spaces, vowels, and repeated punctuation. Binary data can be much flatter. That frequency table tells the compressor which symbols deserve shorter codes.

Then it builds a tree. Frequent bytes end up closer to the root. Rare bytes sink deeper. Walking left or right through the tree gives each byte a bit pattern.

The trick is that the codes have variable length. A common byte might become:

```text
e -> 011
```

while a rarer byte might need something longer:

```text
z -> 11010110
```

No separators are needed because the tree makes the codes prefix-free. The decoder reads bits, walks the same tree, and emits a byte whenever it reaches a leaf.

That is the core loop in Hz. Count bytes, build a deterministic tree, encode through it, and store enough metadata so the decoder can rebuild the same tree later.

## Try The Frequency Table

Before the tree, there is just counting. Edit the text below and watch the weights move around. Spaces are shown explicitly because the compressor does not care that humans like to pretend whitespace is invisible.

```huffman-frequency
```

This is the first small intuition: repeated symbols are the ones worth making cheap.

## Build The Tree

The tree comes from repeatedly combining the two lightest nodes. The new parent goes back into the queue, and the process continues until one root remains.

```huffman-tree
```

That tiny loop decides the final codebook. I like algorithms where the whole thing fits in a few lines and still feels clever.

## Walk The Codes

Once the tree exists, the codes fall out of it. Left contributes `0`, right contributes `1`, and the path to a leaf becomes that character's code.

```huffman-codes
```

The table is generated from the actual tree. No separate hand-written examples, because that is how demo code starts lying.

## Encode The Text

The final step is replacing each character with its code and appending those bits into the payload.

```huffman-encoding
```

This is where the practical catch shows up: the payload can shrink while a tiny full archive still grows, because the decoder needs metadata. Compression has overhead. Tiny examples love embarrassing compression algorithms.

## The First Version

The first version was a SwiftUI app.

I wanted something native and simple: drag in a file, pick a destination, get a `.hz` archive, then drag the archive back in and recover the original file.

The early implementation lived mostly in Swift. Frequency table, Huffman tree, bit writer, bit reader, codec. Nothing fancy.

But then the first file round-tripped:

```text
original file -> .hz archive -> original file
```

That moment is dangerous. Once something works, I immediately start thinking it should have a real file format.

I did not want the archive to be a mystery blob that only the current code understood. Hz archives use a versioned `.hz` format with a small header, the original byte count, the meaningful encoded bit count, a sorted frequency table, and the packed Huffman payload.

The archive begins with a magic value:

```text
HZF1
```

That tiny `HZF1` made the project feel more real than it probably deserved at the time. The decoder can reject non-Hz files, check the format version, and avoid treating random bytes as an archive.

## When Performance Became Interesting

The first version loaded the whole file into memory.

For small files, that is fine. It is also the easiest code to write: read the file into `Data`, compress it into another `Data`, and write it out.

Then I started thinking about larger files, and the architecture started looking a little too cozy.

Compression wants to be file-oriented. At some point memory usage becomes part of the design, whether or not you invited it.

Streaming pushed the project in a better direction. Instead of one big transformation over a byte array, the engine starts to look like:

```text
read chunk -> encode bits -> write chunk
```

Huffman coding makes this slightly awkward. To encode the payload, the compressor needs the frequency table first. So ordinary Huffman compression cannot fully stream in one pass unless the format changes or the input gets spooled somewhere.

Hz handles the native streaming path with two bounded passes over seekable input. First pass: count frequencies and determine the header fields. Second pass: reread the input and write encoded bits directly to the destination.

That was when the project stopped feeling like "I implemented an algorithm" and started feeling like an actual compression tool.

## Bringing Rust Into The Project

I was not expecting Rust to become part of this project, but here we are.

After the Swift implementation worked, I wanted to explore a native backend. Part of it was curiosity. Rust is a nice fit for binary formats, bit-level code, and file I/O because it gives low-level control without making memory ownership feel like a dare.

This was not about proving Rust is better than Swift. Swift still owns the desktop experience, file workflow, and app state. Rust handles the native compression engine.

The split made the architecture cleaner.

In Swift, compression sits behind a small abstraction:

```swift
protocol CompressionEngine {
    func compress(_ input: Data, options: CompressionOptions) throws -> CompressionResult
    func decompress(_ archive: Data, options: DecompressionOptions) throws -> Data
}
```

That interface let me keep the Swift reference engine and add a Rust engine without rewriting the app around either one.

The Rust library is linked through a C ABI, which forced useful discipline. Only C-compatible types cross the boundary. Swift owns input memory. Rust owns returned output buffers until Swift copies and releases them. Errors have to be explicit.

The compiler had opinions. The linker had other opinions. Eventually they negotiated.

That glue code is not glamorous, but I ended up liking it. It made the boundary between the app and the engine very concrete.

## Measuring Instead Of Guessing

Once there were two implementations, guessing got less useful.

I thought I had decent intuition about which path would be faster and where streaming would help. I did not trust that intuition enough, so Hz grew a benchmark suite.

The runner compares the Swift reference engine, the Rust in-memory backend, the Rust streaming path, and recursive compression modes. It also generates deterministic workloads with different byte distributions:

- repetitive text;
- prose-like text;
- high-entropy binary data;
- repeated single-byte data;
- compressed-like binary data.

Those workloads matter because compression behavior depends heavily on input shape. Repetitive text and high-entropy binary data exercise the compressor differently. Tree shape changes. Output ratio changes. Metadata overhead becomes more or less painful.

The best part of the benchmark suite is not any single number. It is the habit: change something, measure it, compare implementations, and verify that decompression still returns the original bytes.

That last part matters. A fast compressor that cannot round-trip the input is just a bug with a stopwatch.

## Documentation And Research

Hz produced more writing than I expected.

The repository now has documentation for the archive format, the native engine, and the streaming design. It also has papers exploring recursive Huffman behavior and implementation benchmarks across Swift, Rust, and streaming modes.

I did not start the project planning to write papers about it. Past me thought he was building a small compressor. Past me was wrong.

The archive format document forced me to answer questions that code can hide for a while. What is the byte order? How are padding bits handled? What makes an archive malformed? How does the decoder rebuild the tree?

The streaming design note captured boundaries that future me would absolutely forget. Compression streams over seekable input. Decompression can work from non-seekable input. Recursive adaptive compression is still in-memory because it compares candidate archives before accepting a layer.

The benchmark paper made the comparisons more deliberate and reproducible.

Writing about the software made the software better. Code says what happens. Notes explain why I made it happen that way.

## Looking Back

Hz reminded me that architecture often appears after the first useful version exists.

I did not start with an engine abstraction because I wanted a diagram. I started with a compressor. The abstraction became useful when there were two engines. The archive spec became useful when Swift and Rust both needed to agree on the same bytes. The benchmark suite became useful when performance questions stopped being hypothetical.

Profiling also beat assumptions, repeatedly. Compression is full of trade-offs that sound obvious until they meet real workloads. A format field that feels small can matter on tiny inputs. Streaming can improve memory behavior while adding overhead. Recursive compression can be useful, but only if it is measured instead of accepted on vibes.

The Swift/Rust split was more pleasant than I expected. Swift gives the app the native macOS feel. Rust gives the lower-level engine a compact place for binary parsing, streaming, and FFI boundaries.

Mostly, Hz taught me that small projects are allowed to grow naturally. Sometimes the first question is simple, and the project gets interesting because the next questions keep appearing.

## What Comes Next

Hz is still evolving.

There are plenty of directions I want to poke at: a better interface, more compression algorithms, alternative archive formats, more benchmark workloads, and deeper research around recursive compression and streaming trade-offs.

I do not know which one becomes the next real part of the project. That is part of the fun and also how I end up with benchmark frameworks I did not plan to build.

For now, Hz is a Huffman compressor, a macOS app, a Swift/Rust experiment, and a reminder that even a tiny archive format can pull you into a lot of systems programming.
