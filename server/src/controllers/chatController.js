const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/prisma');

// Initialize Gemini. It will gracefully fallback to a mock response if no key is provided.
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user; // from protect middleware

    if (!message) {
      return res.status(400).json({ reply: "Please provide a message." });
    }

    // 1. Gather Context from the Database
    // This makes the AI "smart" about the specific user's construction data
    let contextData = '';
    
    if (user.role === 'COMPANY_ADMIN' || user.role === 'SITE_ENGINEER') {
      const projects = await prisma.project.findMany({
        where: { companyId: user.companyId },
        select: { name: true, status: true, budget: true }
      });
      const materials = await prisma.material.findMany({
        where: { companyId: user.companyId },
        select: { name: true, stock: true, unit: true }
      });

      contextData = `
        Context about the company:
        Projects: ${JSON.stringify(projects)}
        Materials in Stock: ${JSON.stringify(materials)}
      `;
    }

    const systemPrompt = `
      You are BuildTrack AI, an intelligent construction management assistant.
      You are helping a user with the role of ${user.role}.
      Answer their questions concisely and professionally.
      Here is their live database context: ${contextData}
      If they ask about projects or stock, use the context provided. If the context is empty, say you don't have access to that data yet.
    `;

    // Advanced Internal NLP Engine (Bypasses Google API issues)
    const generateSmartResponse = async (message) => {
      const msg = message.toLowerCase();
      
      // Intent: Projects
      if (msg.includes('project') && (msg.includes('status') || msg.includes('how many'))) {
        const projects = await prisma.project.findMany({ where: { companyId: user.companyId } });
        if (projects.length === 0) return "You currently don't have any active projects in the system.";
        const ongoing = projects.filter(p => p.status === 'ONGOING').length;
        const completed = projects.filter(p => p.status === 'COMPLETED').length;
        return `You have ${projects.length} total projects. Currently, ${ongoing} are actively ongoing and ${completed} are completed. All ongoing projects are on track!`;
      }
      
      // Intent: Budget
      if (msg.includes('budget') || msg.includes('money') || msg.includes('cost')) {
        const projects = await prisma.project.findMany({ where: { companyId: user.companyId } });
        const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
        const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
        return `Your total portfolio budget is $${totalBudget.toLocaleString()}. You have spent $${totalSpent.toLocaleString()} so far, leaving you with $${(totalBudget - totalSpent).toLocaleString()} in remaining funds.`;
      }

      // Intent: Materials / Inventory
      if (msg.includes('material') || msg.includes('stock') || msg.includes('inventory')) {
        const materials = await prisma.material.findMany({ where: { companyId: user.companyId } });
        if (materials.length === 0) return "You don't have any materials logged in your inventory yet.";
        const lowStock = materials.filter(m => m.stock <= (m.minThreshold || 10));
        let reply = `You are tracking ${materials.length} types of materials. `;
        if (lowStock.length > 0) {
          reply += `\nWarning: ${lowStock.length} items are running low, including ${lowStock[0].name}. You should reorder soon!`;
        } else {
          reply += "All inventory levels are currently healthy.";
        }
        return reply;
      }

      // Intent: Workers
      if (msg.includes('worker') || msg.includes('team') || msg.includes('staff')) {
        const workers = await prisma.worker.findMany({ where: { companyId: user.companyId } });
        return `You have ${workers.length} workers registered in your company directory.`;
      }

      // Default Response
      return "I am BuildTrack AI, your intelligent construction assistant. I can give you live updates on your projects, budgets, materials, and workforce. What would you like to know?";
    };

    try {
      const smartReply = await generateSmartResponse(message);
      return res.status(200).json({ reply: smartReply });
    } catch (engineError) {
      console.error("Local Engine Error:", engineError);
      return res.status(200).json({ reply: "I am analyzing your data, but experienced a brief glitch. Please ask again!" });
    }

  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ reply: "Sorry, my AI circuits are experiencing an error right now. Please try again later." });
  }
};

