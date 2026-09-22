const fs = require('fs');
let content = fs.readFileSync('client/src/context/VendorContext.jsx', 'utf8');

const newFunctions = `
  const [receivings, setReceivings] = useState([]);

  const fetchReceivings = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('http://localhost:5000/api/purchase-orders/receipts/all', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      const data = await res.json();
      if (res.ok) setReceivings(data);
    } catch (err) {
      console.error('Failed to fetch receivings', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) {
      fetchReceivings();
    }
  }, [currentUser, fetchReceivings]);

  const receiveMaterial = async (data) => {
    const res = await fetch(\`http://localhost:5000/api/purchase-orders/\${data.poId}/receive\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to receive material');
    fetchReceivings();
    fetchPurchaseOrders();
    return result;
  };
`;

content = content.replace('const [purchaseOrders, setPurchaseOrders] = useState([]);', 'const [purchaseOrders, setPurchaseOrders] = useState([]);\n' + newFunctions);

// add to provider
content = content.replace('updatePOStatus,', 'updatePOStatus,\n      receivings,\n      receiveMaterial,');

fs.writeFileSync('client/src/context/VendorContext.jsx', content);

