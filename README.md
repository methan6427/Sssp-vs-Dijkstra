# SSSP vs Dijkstra - Algorithm Visualization

An interactive React TypeScript application demonstrating the groundbreaking SSSP algorithm from the 2025 research paper **"Breaking the Sorting Barrier for Directed Single-Source Shortest Paths"** by Duan, Mao, Mao, Shu, and Yin.

## 🚀 Key Features

- **Side-by-side comparison** of Dijkstra's algorithm and the new SSSP algorithm
- **Interactive visualization** with step-by-step animation
- **Real-time statistics** showing execution time, operations, and complexity
- **Multiple preset graphs** and random graph generator
- **Dark/Light mode** for comfortable viewing
- **Educational tooltips** explaining each algorithm step

## 🎯 Algorithmic Innovation

### Dijkstra's Algorithm
- **Complexity**: O(m + n log n)
- Uses a priority queue to process vertices by minimum distance
- Classic approach, established for decades

### New SSSP Algorithm  
- **Complexity**: O(m log^(2/3) n)
- **Key Innovation 1**: FindPivots reduces frontier from |S| to ~|S|/k vertices
- **Key Innovation 2**: BMSSP (Bounded Multi-Source Shortest Path) uses recursive divide-and-conquer
- **Key Innovation 3**: Adaptive frontier avoids full O(n log n) sorting barrier
- **Result**: Faster on sparse graphs, breaking the theoretical barrier!

## 📦 Installation

```bash
# Navigate to project directory
cd "c:\akaza\General\Antigravit Projects\SSSP VS DIJKSTRA"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage

1. **Select a Graph**: Choose from preset graphs or generate a random one
2. **Choose Nodes**: Select source and destination nodes
3. **Run Algorithm**: Click "Run Dijkstra" or "Run New SSSP"
4. **Watch Animation**: Use play/pause controls, adjust speed
5. **Compare Results**: Click "Run Both" to see side-by-side comparison

## 🏗️ Project Structure

```
src/
├── algorithms/
│   ├── types.ts           # TypeScript type definitions
│   ├── Graph.ts           # Graph class and generators
│   ├── MinHeap.ts         # Priority queue for Dijkstra
│   ├── AdaptiveFrontier.ts # Frontier structure for new SSSP
│   ├── Dijkstra.ts        # Dijkstra's algorithm
│   └── NewSSSP.ts         # New SSSP algorithm
├── components/
│   ├── GraphCanvas.tsx    # Canvas-based graph visualization
│   ├── ControlPanel.tsx   # Animation controls
│   ├── ComparisonPanel.tsx # Algorithm statistics
│   ├── InfoPanel.tsx      # Step-by-step explanations
│   └── GraphSelector.tsx  # Graph selection and node picker
├── App.tsx                # Main application
├── main.tsx               # React entry point
└── index.css              # Styles and Tailwind
```

## 🎨 Visualization Color Code

- **Gray**: Unvisited nodes
- **Blue**: Visited nodes  
- **Yellow**: Current node being processed
- **Green**: Completed nodes (final distance determined)
- **Purple**: Pivot nodes (new algorithm only)
- **Red**: Shortest path

## 📊 Understanding the Comparison

The new SSSP algorithm achieves O(m log^(2/3) n) complexity through:

1. **FindPivots Algorithm**: Performs k Bellman-Ford relaxation steps to identify vertices with large shortest-path trees (≥k descendants). Only these "pivot" vertices need to remain in the frontier, reducing it from |S| to approximately |S|/k.

2. **BMSSP (Bounded Multi-Source Shortest Path)**: Recursive divide-and-conquer approach that processes the frontier in batches of size ~2^((l-1)t), avoiding the need to maintain full vertex ordering.

3. **Adaptive Partitioning**: The adaptive frontier structure pulls vertices without requiring full O(n log n) sorting, breaking the theoretical barrier.

### When is the New Algorithm Faster?

- **Sparse graphs** (m ≈ n): New algorithm shows significant speedup
- **Dense graphs** (m ≈ n²): Dijkstra may be competitive
- **Large graphs**: The advantage becomes more pronounced as n grows

## 🔬 Technical Details

- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **Tailwind CSS** for modern, responsive design
- **HTML5 Canvas** for high-performance graph rendering
- **No external graph libraries** - custom implementation for educational transparency

## 📚 Research Paper

This visualization is based on:
> Duan, R., Mao, T., Mao, Y., Shu, X., & Yin, L. (2025). Breaking the Sorting Barrier for Directed Single-Source Shortest Paths.

## 🎓 Educational Value

This tool is perfect for:
- Understanding shortest path algorithms
- Visualizing algorithm execution step-by-step
- Comparing algorithmic complexities in practice
- Learning about cutting-edge algorithm research
- Teaching graph algorithms in computer science courses

## 🤝 Contributing

This is an educational visualization project. Feel free to:
- Report bugs or issues
- Suggest new features
- Add more preset graphs
- Improve the visualization

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Research paper authors: Duan, Mao, Mao, Shu, and Yin
- The React and TypeScript communities
- All contributors to open-source graph algorithm research

---

**Built with ❤️ to demonstrate the beauty of algorithmic innovation**
