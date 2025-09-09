require("dotenv").config(); // Load environment variables
const io = require("socket.io")(process.env.PORT || 3000, {
  cors: {
    origin: process.env.URL || "*", // Allow configured URL or all origins as fallback
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
});

let lightStates = {}; // Track light state for each slot
let slotParagraphs = {}; // Map slot IDs to assigned paragraphs

// Predefined paragraphs

const paragraphs = [
  "In the world of technology, the rapid advancement of artificial intelligence (AI) has sparked significant changes across various industries. AI technologies, such as machine learning, natural language processing, and deep learning, have revolutionized how businesses operate, interact with customers, and analyze data. The capabilities of AI are increasingly being integrated into daily life, from personal assistants like Siri and Alexa to autonomous vehicles and healthcare diagnostic systems. One of the most impactful innovations is the application of AI in data analysis, enabling businesses to make data-driven decisions faster and with greater accuracy. AI algorithms can process vast amounts of data in real time, recognizing patterns that would be impossible for humans to detect. However, the rise of AI also brings concerns about job displacement, ethics, and the potential for misuse. As AI systems become more advanced, it is crucial for policymakers and technologists to work together to establish regulations and ethical guidelines to ensure that AI is used responsibly and for the benefit of society. Moreover, the development of AI is closely linked with advancements in computing power, as the processing capabilities of modern computers allow for more complex algorithms and faster data processing. This interplay between hardware and software is likely to accelerate the evolution of AI, opening up new opportunities and challenges that will shape the future of technology.",

  "The Internet of Things (IoT) is another technology trend that is reshaping the way people interact with their environments. IoT refers to the interconnection of everyday objects and devices through the internet, enabling them to collect and share data. From smart home devices like thermostats and security cameras to industrial applications such as predictive maintenance for machinery, IoT has far-reaching implications for both consumers and businesses. The integration of IoT into homes and workplaces allows for automation, enhanced efficiency, and improved user experiences. For example, smart refrigerators can monitor food inventory and suggest recipes based on available ingredients, while wearable fitness trackers help individuals monitor their health in real time. On a larger scale, IoT can improve supply chain management by providing real-time data on inventory levels, shipments, and equipment performance. However, with the growth of IoT comes the challenge of managing vast amounts of data and ensuring the security of interconnected devices. As IoT devices become more prevalent, concerns about data privacy, cybersecurity, and the potential for hacking have emerged. Manufacturers must prioritize robust security measures to prevent unauthorized access to sensitive data, and consumers need to be aware of potential risks associated with their devices.",

  "Blockchain technology, the foundation behind cryptocurrencies like Bitcoin, has garnered significant attention for its potential to disrupt industries beyond finance. Blockchain is a decentralized ledger system that allows for secure, transparent, and immutable transactions without the need for intermediaries such as banks. Its applications extend far beyond cryptocurrencies, including supply chain management, voting systems, and identity verification. For instance, blockchain can be used to track the provenance of goods, ensuring that products are ethically sourced and that their journey through the supply chain is transparent. In the realm of healthcare, blockchain could allow patients to have secure, private control over their medical records, sharing them only with authorized healthcare providers. Despite its promise, blockchain faces several challenges that could hinder its widespread adoption. One of the major concerns is scalability, as current blockchain networks can struggle to process large volumes of transactions quickly and efficiently. Additionally, the energy consumption associated with some blockchain networks, particularly those using proof-of-work consensus mechanisms, has raised environmental concerns. However, ongoing research into more energy-efficient blockchain models and improvements in scalability could address these challenges, making blockchain a more viable solution for a variety of industries in the future.",

  "Cloud computing has revolutionized the way businesses store, manage, and process data. By providing on-demand access to computing resources over the internet, cloud computing has enabled organizations to scale their operations without the need for significant upfront investment in physical infrastructure. With cloud platforms such as Amazon Web Services (AWS), Microsoft Azure, and Google Cloud, businesses can leverage a wide range of services, including storage, computing power, machine learning, and data analytics. This flexibility allows organizations to adapt quickly to changing business needs and innovate more rapidly. Cloud computing has also facilitated the rise of software-as-a-service (SaaS) applications, which enable companies to access powerful software tools without the need for installation or maintenance. These cloud-based applications have become an essential part of modern business operations, from customer relationship management (CRM) systems to enterprise resource planning (ERP) software. However, the shift to the cloud has raised concerns around data security and privacy, as sensitive information is stored remotely rather than on-premises. To mitigate these risks, businesses must implement strong encryption, authentication protocols, and data governance practices. Despite these challenges, the benefits of cloud computing in terms of cost savings, flexibility, and scalability continue to drive its widespread adoption.",

  "Quantum computing is an emerging field that holds the potential to revolutionize industries by solving complex problems that are beyond the reach of classical computers. Unlike traditional computers, which process data using bits (0s and 1s), quantum computers use quantum bits, or qubits, which can represent multiple states simultaneously due to the principles of quantum mechanics. This ability to perform parallel computations could enable quantum computers to solve certain types of problems exponentially faster than classical computers. Quantum computing has applications in fields such as cryptography, material science, drug discovery, and artificial intelligence. For example, quantum computers could be used to break current encryption methods, prompting the development of new, more secure encryption techniques. In drug discovery, quantum simulations could help identify potential drug compounds more efficiently, accelerating the development of life-saving medications. However, quantum computing is still in its early stages, and significant technical challenges remain, such as improving qubit stability and error correction. Additionally, quantum computers require extremely low temperatures and sophisticated hardware to operate, making them expensive to develop and maintain. Despite these challenges, major technology companies and research institutions are making significant strides in quantum computing research, and it is likely that the technology will continue to advance in the coming years, bringing us closer to realizing its transformative potential."
];


// Utility function to randomly assign a paragraph to a slot
function assignRandomParagraph(slotId) {
  if (!slotParagraphs[slotId]) {
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    slotParagraphs[slotId] = randomParagraph;
  }
  return slotParagraphs[slotId];
}

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit the current light state and assigned paragraph to the connected client
  socket.on("request-light-state", (data) => {
    const { slotId } = data;
    const assignedParagraph = assignRandomParagraph(slotId); // Ensure paragraph is assigned
    socket.emit("light-state", {
      slotId,
      isGreen: lightStates[slotId] || false,
      paragraph: assignedParagraph,
    });
  });

  // Admin toggles the light
  socket.on("toggle-light", (data) => {
    const { slotId } = data;
    lightStates[slotId] = !lightStates[slotId];
    io.emit("light-toggle", {
      slotId,
      isGreen: lightStates[slotId],
    }); // Notify all clients
    console.log(`Light for slot ${slotId} is now ${lightStates[slotId] ? "green" : "red"}`);
  });

  socket.on("score-update", (data) => {
    // Broadcast the score update to all connected clients
    io.emit("leaderboard-update", {
      slotId: data.slotId,
      username: data.username,
      score: data.score
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
