import { useState, useMemo } from "react";

const MACHINE_TYPES = [
  // Engins BTP
  "Pelle hydraulique","Bulldozer","Chargeuse","Compacteur","Grue mobile","Niveleuse","Tombereau","Finisseur","Foreuse","Chariot télescopique",
  // Petit outillage
  "Perceuse","Perceuse à percussion","Marteau piqueur","Marteau perforateur","Disqueuse","Meuleuse","Tronçonneuse","Scie circulaire","Visseuse","Ponceuse","Compresseur","Groupe électrogène","Pompe à eau","Vibreur à béton","Pistolet à clouer","Chalumeau","Nettoyeur haute pression",
  "Autre"
];
const INTERVENTION_TYPES = ["Correctif","Préventif","Amélioratif"];
const CAUSES = ["Matière","Méthode","Machine","Main d'œuvre","Milieu","Mesure"];

const initialClients = [
  { id: 1, nom: "BTP Sud", contact: "Jean Dupont", tel: "06 12 34 56 78", email: "contact@btpsud.fr" },
  { id: 2, nom: "Constructions Martin", contact: "Paul Martin", tel: "06 98 76 54 32", email: "p.martin@constructions.fr" },
];

const initialMachines = [
  { id: 1, nom: "CAT 320", type: "Pelle hydraulique", marque: "Caterpillar", serie: "CAT-001", annee: 2018, clientId: 1 },
  { id: 2, nom: "D6T", type: "Bulldozer", marque: "Caterpillar", serie: "CAT-002", annee: 2019, clientId: 1 },
  { id: 3, nom: "JD 644K", type: "Chargeuse", marque: "John Deere", serie: "JD-001", annee: 2020, clientId: 2 },
];
const initialInterventions = [
  { id: 1, machineId: 1, date: "2024-01-10", type: "Correctif", description: "Fuite hydraulique", technicien: "Dupont", duree: 8, cout: 1200, panne: "Hydraulique" },
  { id: 2, machineId: 1, date: "2024-02-15", type: "Préventif", description: "Vidange moteur", technicien: "Martin", duree: 3, cout: 350, panne: "Moteur" },
  { id: 3, machineId: 2, date: "2024-01-20", type: "Correctif", description: "Chenille cassée", technicien: "Dupont", duree: 12, cout: 2500, panne: "Transmission" },
  { id: 4, machineId: 2, date: "2024-03-05", type: "Correctif", description: "Moteur surchauffe", technicien: "Leroy", duree: 6, cout: 800, panne: "Moteur" },
  { id: 5, machineId: 3, date: "2024-02-01", type: "Préventif", description: "Graissage général", technicien: "Martin", duree: 2, cout: 150, panne: "Entretien" },
  { id: 6, machineId: 1, date: "2024-03-20", type: "Correctif", description: "Bras cassé", technicien: "Leroy", duree: 20, cout: 4500, panne: "Structure" },
];

const COLORS = ["#2563eb","#dc2626","#16a34a","#d97706","#9333ea","#0891b2"];

function ParetoChart({ interventions }) {
  const panneCount = {};
  interventions.forEach(i => { panneCount[i.panne] = (panneCount[i.panne]||0)+1; });
  const sorted = Object.entries(panneCount).sort((a,b)=>b[1]-a[1]);
  const total = sorted.reduce((s,[,v])=>s+v,0);
  let cumul = 0;
  const data = sorted.map(([k,v])=>{ cumul+=v; return {k,v,pct:Math.round(cumul/total*100)}; });
  const maxV = Math.max(...data.map(d=>d.v));
  const W=520, H=220, PL=40, PR=40, PT=20, PB=50;
  const bw=(W-PL-PR)/data.length-6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:520}}>
      {[0,25,50,75,100].map(p=>{
        const y=PT+(H-PT-PB)*(1-p/100);
        return <g key={p}><line x1={PL} x2={W-PR} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1"/><text x={PL-4} y={y+4} fontSize="10" fill="#6b7280" textAnchor="end">{p}%</text></g>;
      })}
      {data.map((d,i)=>{
        const x=PL+i*(bw+6)+3;
        const bh=(H-PT-PB)*(d.v/maxV);
        const by=PT+(H-PT-PB)-bh;
        return <g key={d.k}>
          <rect x={x} y={by} width={bw} height={bh} fill="#2563eb" rx="2"/>
          <text x={x+bw/2} y={H-PB+14} fontSize="9" fill="#374151" textAnchor="middle">{d.k}</text>
          <text x={x+bw/2} y={by-4} fontSize="9" fill="#1d4ed8" textAnchor="middle">{d.v}</text>
        </g>;
      })}
      {data.length>1 && <polyline points={data.map((d,i)=>`${PL+i*(bw+6)+3+bw/2},${PT+(H-PT-PB)*(1-d.pct/100)}`).join(" ")} fill="none" stroke="#dc2626" strokeWidth="2"/>}
      {data.map((d,i)=>{
        const cx=PL+i*(bw+6)+3+bw/2, cy=PT+(H-PT-PB)*(1-d.pct/100);
        return <circle key={d.k} cx={cx} cy={cy} r={3} fill="#dc2626"/>;
      })}
      <text x={W/2} y={H-2} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">Diagramme de Pareto – Types de pannes</text>
    </svg>
  );
}

function IshikawaChart({ cause, effects }) {
  const W=580, H=280;
  const spines = [["Matière","#2563eb"],["Méthode","#16a34a"],["Machine","#dc2626"],["Main d'œuvre","#d97706"],["Milieu","#9333ea"],["Mesure","#0891b2"]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:580}}>
      <line x1={60} y1={H/2} x2={W-80} y2={H/2} stroke="#374151" strokeWidth="3"/>
      <polygon points={`${W-80},${H/2-12} ${W-20},${H/2} ${W-80},${H/2+12}`} fill="#374151"/>
      <rect x={W-20} y={H/2-18} width={70} height={36} fill="#dc2626" rx="4"/>
      <text x={W-20+35} y={H/2+5} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">{cause}</text>
      {spines.map(([s,c],i)=>{
        const top=i<3;
        const xBase=100+i%3*130, yEnd=H/2, yStart=top?40:H-40;
        return <g key={s}>
          <line x1={xBase} y1={yStart} x2={xBase+40} y2={yEnd} stroke={c} strokeWidth="2"/>
          <text x={xBase-4} y={top?yStart-6:yStart+14} fontSize="10" fill={c} textAnchor="middle" fontWeight="bold">{s}</text>
          {(effects[s]||[]).map((e,j)=>{
            const lx=xBase+(top?j*18:j*18), ly=top?yStart+18+j*16:yStart-18-j*16;
            return <text key={j} x={lx} y={top?ly:ly} fontSize="8" fill="#374151">{e}</text>;
          })}
        </g>;
      })}
      <text x={W/2} y={H-6} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">Diagramme d'Ishikawa</text>
    </svg>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:12,padding:24,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#1e3a5f"}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#6b7280"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>{label}</label>
      <input {...props} style={{width:"100%",padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:14,boxSizing:"border-box",...props.style}}/>
    </div>
  );
}
function Select({ label, children, ...props }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>{label}</label>
      <select {...props} style={{width:"100%",padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:14,boxSizing:"border-box"}}>{children}</select>
    </div>
  );
}

const Btn = ({children, color="#2563eb", onClick, small}) => (
  <button onClick={onClick} style={{background:color,color:"white",border:"none",borderRadius:6,padding:small?"4px 10px":"8px 16px",fontSize:small?12:14,fontWeight:600,cursor:"pointer"}}>{children}</button>
);

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [machines, setMachines] = useState(initialMachines);
  const [interventions, setInterventions] = useState(initialInterventions);
  const [clients, setClients] = useState(initialClients);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showIntervModal, setShowIntervModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editMachine, setEditMachine] = useState(null);
  const [editInterv, setEditInterv] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [ishikawaMachine, setIshikawaMachine] = useState(null);

  const emptyMachine = { nom:"", type:MACHINE_TYPES[0], marque:"", serie:"", annee:new Date().getFullYear(), clientId:"" };
  const emptyInterv = { machineId:"", date:"", type:INTERVENTION_TYPES[0], description:"", technicien:"", duree:"", cout:"", panne:"" };
  const emptyClient = { nom:"", contact:"", tel:"", email:"" };

  const [mForm, setMForm] = useState(emptyMachine);
  const [iForm, setIForm] = useState(emptyInterv);
  const [cForm, setCForm] = useState(emptyClient);

  const kpis = useMemo(() => {
    return machines.map(m => {
      const ints = interventions.filter(i=>i.machineId===m.id);
      const correctifs = ints.filter(i=>i.type==="Correctif");
      const totalCout = ints.reduce((s,i)=>s+Number(i.cout),0);
      const totalDuree = ints.reduce((s,i)=>s+Number(i.duree),0);
      const mtbf = correctifs.length>1 ? Math.round(365/correctifs.length*10)/10 : "N/A";
      const mttr = correctifs.length ? Math.round(correctifs.reduce((s,i)=>s+Number(i.duree),0)/correctifs.length*10)/10 : 0;
      const client = clients.find(c=>c.id===Number(m.clientId));
      return { ...m, ints:ints.length, correctifs:correctifs.length, totalCout, totalDuree, mtbf, mttr, clientNom:client?.nom||"-" };
    });
  }, [machines, interventions, clients]);

  const totalCout = interventions.reduce((s,i)=>s+Number(i.cout),0);
  const totalDuree = interventions.reduce((s,i)=>s+Number(i.duree),0);

  const ishikawaData = useMemo(() => {
    if (!ishikawaMachine) return {};
    const ints = interventions.filter(i=>i.machineId===ishikawaMachine.id && i.type==="Correctif");
    const d = {};
    CAUSES.forEach(c => d[c]=[]);
    ints.forEach(i => {
      if(i.description) {
        const cat = i.panne==="Hydraulique"?"Machine":i.panne==="Moteur"?"Machine":i.panne==="Transmission"?"Machine":i.panne==="Structure"?"Machine":i.panne==="Entretien"?"Méthode":"Main d'œuvre";
        d[cat] = [...(d[cat]||[]), i.description.slice(0,18)];
      }
    });
    return d;
  }, [ishikawaMachine, interventions]);

  function saveClient() {
    if (!cForm.nom) return;
    if (editClient) {
      setClients(clients.map(c=>c.id===editClient.id?{...cForm,id:c.id}:c));
    } else {
      setClients([...clients, {...cForm, id:Date.now()}]);
    }
    setShowClientModal(false); setEditClient(null); setCForm(emptyClient);
  }
  function delClient(id) {
    if(window.confirm("Supprimer ce client ?")) setClients(clients.filter(c=>c.id!==id));
  }
  function saveMachine() {
    if (!mForm.nom) return;
    if (editMachine) {
      setMachines(machines.map(m=>m.id===editMachine.id?{...mForm,id:m.id}:m));
    } else {
      setMachines([...machines, {...mForm, id:Date.now()}]);
    }
    setShowMachineModal(false); setEditMachine(null); setMForm(emptyMachine);
  }
  function saveInterv() {
    if (!iForm.machineId||!iForm.date) return;
    const d = {...iForm, machineId:Number(iForm.machineId), duree:Number(iForm.duree), cout:Number(iForm.cout)};
    if (editInterv) {
      setInterventions(interventions.map(i=>i.id===editInterv.id?{...d,id:i.id}:i));
    } else {
      setInterventions([...interventions, {...d, id:Date.now()}]);
    }
    setShowIntervModal(false); setEditInterv(null); setIForm(emptyInterv);
  }
  function delMachine(id) { if(window.confirm("Supprimer cette machine ?")) setMachines(machines.filter(m=>m.id!==id)); }
  function delInterv(id) { if(window.confirm("Supprimer cette intervention ?")) setInterventions(interventions.filter(i=>i.id!==id)); }

  const navItems = [
    {id:"dashboard",label:"📊 Dashboard"},
    {id:"clients",label:"👷 Clients"},
    {id:"machines",label:"🚧 Machines"},
    {id:"interventions",label:"🔧 Interventions"},
    {id:"analyses",label:"📈 Analyses"},
  ];

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",background:"#f1f5f9",minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)",color:"white",padding:"16px 24px",display:"flex",alignItems:"center",gap:16}}>
        <div style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 14px",fontWeight:900,fontSize:22,letterSpacing:2}}>ATEC</div>
        <div>
          <div style={{fontWeight:700,fontSize:16}}>Gestion de Maintenance BTP</div>
          <div style={{fontSize:12,opacity:0.8}}>Suivi des interventions & analyses</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",display:"flex",gap:4,padding:"0 16px",overflowX:"auto"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:"none",border:"none",padding:"14px 16px",fontWeight:tab===n.id?700:400,color:tab===n.id?"#2563eb":"#6b7280",borderBottom:tab===n.id?"3px solid #2563eb":"3px solid transparent",cursor:"pointer",fontSize:14,whiteSpace:"nowrap"}}>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{padding:20,maxWidth:1100,margin:"0 auto"}}>

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div>
        {/* KPI clients */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:24}}>
              {[
                {label:"Clients",val:clients.length,icon:"👷",color:"#0891b2"},
                {label:"Machines",val:machines.length,icon:"🚧",color:"#2563eb"},
                {label:"Interventions",val:interventions.length,icon:"🔧",color:"#16a34a"},
                {label:"Coût total",val:`${totalCout.toLocaleString()} €`,icon:"💶",color:"#d97706"},
                {label:"Heures réparation",val:`${totalDuree} h`,icon:"⏱️",color:"#9333ea"},
              ].map(c=>(
                <div key={c.label} style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",borderLeft:`4px solid ${c.color}`}}>
                  <div style={{fontSize:28}}>{c.icon}</div>
                  <div style={{fontSize:24,fontWeight:800,color:c.color}}>{c.val}</div>
                  <div style={{fontSize:13,color:"#6b7280"}}>{c.label}</div>
                </div>
              ))}
            </div>

            <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:20}}>
              <h3 style={{margin:"0 0 16px",color:"#1e3a5f"}}>KPIs par machine</h3>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                  <thead>
                    <tr style={{background:"#f8fafc"}}>
                      {["Machine","Type","Client","Interventions","Correctifs","MTBF (j)","MTTR (h)","Coût total","Durée tot."].map(h=>(
                        <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"#374151",fontWeight:600,borderBottom:"2px solid #e5e7eb"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map(k=>(
                      <tr key={k.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"10px 12px",fontWeight:600,color:"#1e3a5f"}}>{k.nom}</td>
                        <td style={{padding:"10px 12px",color:"#6b7280"}}>{k.type}</td>
                        <td style={{padding:"10px 12px",color:"#0891b2",fontWeight:600}}>{k.clientNom}</td>
                        <td style={{padding:"10px 12px"}}><span style={{background:"#dbeafe",color:"#1d4ed8",borderRadius:20,padding:"2px 10px",fontSize:12}}>{k.ints}</span></td>
                        <td style={{padding:"10px 12px"}}><span style={{background:"#fee2e2",color:"#dc2626",borderRadius:20,padding:"2px 10px",fontSize:12}}>{k.correctifs}</span></td>
                        <td style={{padding:"10px 12px",fontWeight:600}}>{k.mtbf}</td>
                        <td style={{padding:"10px 12px"}}>{k.mttr} h</td>
                        <td style={{padding:"10px 12px",color:"#d97706",fontWeight:600}}>{Number(k.totalCout).toLocaleString()} €</td>
                        <td style={{padding:"10px 12px"}}>{k.totalDuree} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {tab==="clients" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,color:"#1e3a5f"}}>👷 Clients</h2>
              <Btn onClick={()=>{setEditClient(null);setCForm(emptyClient);setShowClientModal(true)}}>+ Ajouter un client</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
              {clients.map(c=>{
                const nb=machines.filter(m=>Number(m.clientId)===c.id).length;
                return (
                  <div key={c.id} style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",borderLeft:"4px solid #0891b2"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{background:"#cffafe",color:"#0891b2",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:600}}>{nb} machine{nb>1?"s":""}</span>
                      <div style={{display:"flex",gap:6}}>
                        <Btn small color="#6b7280" onClick={()=>{setEditClient(c);setCForm({...c});setShowClientModal(true)}}>✏️</Btn>
                        <Btn small color="#dc2626" onClick={()=>delClient(c.id)}>🗑️</Btn>
                      </div>
                    </div>
                    <div style={{fontWeight:800,fontSize:18,color:"#1e3a5f",marginBottom:6}}>{c.nom}</div>
                    <div style={{fontSize:13,color:"#374151",marginBottom:2}}>👤 {c.contact||"—"}</div>
                    <div style={{fontSize:13,color:"#6b7280",marginBottom:2}}>📞 {c.tel||"—"}</div>
                    <div style={{fontSize:13,color:"#6b7280"}}>✉️ {c.email||"—"}</div>
                  </div>
                );
              })}
              {clients.length===0 && <div style={{color:"#9ca3af",padding:40}}>Aucun client enregistré.</div>}
            </div>
          </div>
        )}

        {/* MACHINES */}
        {tab==="machines" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,color:"#1e3a5f"}}>🚧 Parc machines</h2>
              <Btn onClick={()=>{setEditMachine(null);setMForm(emptyMachine);setShowMachineModal(true)}}>+ Ajouter une machine</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
              {machines.map(m=>{
                const nb=interventions.filter(i=>i.machineId===m.id).length;
                return (
                  <div key={m.id} style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{background:"#dbeafe",color:"#1d4ed8",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:600}}>{m.type}</span>
                      <div style={{display:"flex",gap:6}}>
                        <Btn small color="#6b7280" onClick={()=>{setEditMachine(m);setMForm({...m});setShowMachineModal(true)}}>✏️</Btn>
                        <Btn small color="#dc2626" onClick={()=>delMachine(m.id)}>🗑️</Btn>
                      </div>
                    </div>
                    <div style={{fontWeight:800,fontSize:18,color:"#1e3a5f",marginBottom:4}}>{m.nom}</div>
                    <div style={{fontSize:13,color:"#6b7280"}}>{m.marque} · {m.annee}</div>
                    <div style={{fontSize:12,color:"#9ca3af",marginBottom:4}}>N°{m.serie}</div>
                    {clients.find(c=>c.id===Number(m.clientId)) && <div style={{fontSize:12,color:"#0891b2",fontWeight:600,marginBottom:4}}>👷 {clients.find(c=>c.id===Number(m.clientId)).nom}</div>}
                    <div style={{fontSize:13,color:"#374151"}}>{nb} intervention{nb>1?"s":""}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERVENTIONS */}
        {tab==="interventions" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,color:"#1e3a5f"}}>🔧 Interventions</h2>
              <Btn onClick={()=>{setEditInterv(null);setIForm(emptyInterv);setShowIntervModal(true)}}>+ Nouvelle intervention</Btn>
            </div>
            <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                <thead>
                  <tr style={{background:"#f8fafc"}}>
                    {["Date","Machine","Type","Description","Technicien","Durée","Coût","Panne","Actions"].map(h=>(
                      <th key={h} style={{padding:"12px 14px",textAlign:"left",color:"#374151",fontWeight:600,borderBottom:"2px solid #e5e7eb",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interventions.sort((a,b)=>b.date.localeCompare(a.date)).map(i=>{
                    const m=machines.find(m=>m.id===i.machineId);
                    const typeColor=i.type==="Correctif"?"#fee2e2,#dc2626":i.type==="Préventif"?"#dcfce7,#16a34a":"#fef3c7,#d97706";
                    const [bg,fg]=typeColor.split(",");
                    return (
                      <tr key={i.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"10px 14px",color:"#6b7280"}}>{i.date}</td>
                        <td style={{padding:"10px 14px",fontWeight:600,color:"#1e3a5f"}}>{m?.nom||"?"}</td>
                        <td style={{padding:"10px 14px"}}><span style={{background:bg,color:fg,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>{i.type}</span></td>
                        <td style={{padding:"10px 14px",maxWidth:160}}>{i.description}</td>
                        <td style={{padding:"10px 14px"}}>{i.technicien}</td>
                        <td style={{padding:"10px 14px"}}>{i.duree} h</td>
                        <td style={{padding:"10px 14px",color:"#d97706",fontWeight:600}}>{Number(i.cout).toLocaleString()} €</td>
                        <td style={{padding:"10px 14px"}}><span style={{background:"#f1f5f9",borderRadius:4,padding:"2px 6px",fontSize:12}}>{i.panne}</span></td>
                        <td style={{padding:"10px 14px"}}>
                          <div style={{display:"flex",gap:4}}>
                            <Btn small color="#6b7280" onClick={()=>{setEditInterv(i);setIForm({...i});setShowIntervModal(true)}}>✏️</Btn>
                            <Btn small color="#dc2626" onClick={()=>delInterv(i.id)}>🗑️</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYSES */}
        {tab==="analyses" && (
          <div>
            <h2 style={{margin:"0 0 20px",color:"#1e3a5f"}}>📈 Analyses</h2>
            <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:20}}>
              <h3 style={{margin:"0 0 16px",color:"#1e3a5f"}}>Pareto – Fréquence des pannes</h3>
              <ParetoChart interventions={interventions}/>
            </div>
            <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:20}}>
              <h3 style={{margin:"0 0 8px",color:"#1e3a5f"}}>Ishikawa – Causes racines</h3>
              <p style={{fontSize:13,color:"#6b7280",margin:"0 0 12px"}}>Sélectionnez une machine :</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                {machines.map(m=>(
                  <button key={m.id} onClick={()=>setIshikawaMachine(ishikawaMachine?.id===m.id?null:m)}
                    style={{padding:"6px 14px",borderRadius:20,border:`2px solid ${ishikawaMachine?.id===m.id?"#2563eb":"#e5e7eb"}`,background:ishikawaMachine?.id===m.id?"#dbeafe":"white",color:ishikawaMachine?.id===m.id?"#1d4ed8":"#374151",cursor:"pointer",fontWeight:600,fontSize:13}}>
                    {m.nom}
                  </button>
                ))}
              </div>
              {ishikawaMachine && <IshikawaChart cause={ishikawaMachine.nom} effects={ishikawaData}/>}
              {!ishikawaMachine && <div style={{textAlign:"center",color:"#9ca3af",padding:40}}>Sélectionnez une machine pour afficher le diagramme</div>}
            </div>
            <div style={{background:"white",borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              <h3 style={{margin:"0 0 16px",color:"#1e3a5f"}}>Coûts & durées par machine</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
                {kpis.map((k,i)=>(
                  <div key={k.id} style={{flex:"1 1 200px",background:"#f8fafc",borderRadius:10,padding:16,borderLeft:`4px solid ${COLORS[i%COLORS.length]}`}}>
                    <div style={{fontWeight:700,marginBottom:8,color:"#1e3a5f"}}>{k.nom}</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:"#6b7280"}}>Coût</span><span style={{fontWeight:700,color:COLORS[i%COLORS.length]}}>{k.totalCout.toLocaleString()} €</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:"#6b7280"}}>Durée</span><span style={{fontWeight:700}}>{k.totalDuree} h</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#6b7280"}}>MTBF</span><span style={{fontWeight:700}}>{k.mtbf} {k.mtbf!=="N/A"?"j":""}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CLIENT */}
      {showClientModal && (
        <Modal title={editClient?"Modifier le client":"Nouveau client"} onClose={()=>setShowClientModal(false)}>
          <Input label="Nom de l'entreprise *" value={cForm.nom} onChange={e=>setCForm({...cForm,nom:e.target.value})} placeholder="ex: BTP Sud"/>
          <Input label="Contact" value={cForm.contact} onChange={e=>setCForm({...cForm,contact:e.target.value})} placeholder="Nom du responsable"/>
          <Input label="Téléphone" value={cForm.tel} onChange={e=>setCForm({...cForm,tel:e.target.value})} placeholder="06 xx xx xx xx"/>
          <Input label="Email" value={cForm.email} onChange={e=>setCForm({...cForm,email:e.target.value})} placeholder="contact@entreprise.fr"/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn color="#6b7280" onClick={()=>setShowClientModal(false)}>Annuler</Btn>
            <Btn onClick={saveClient}>Enregistrer</Btn>
          </div>
        </Modal>
      )}

      {/* MODAL MACHINE */}
      {showMachineModal && (
        <Modal title={editMachine?"Modifier la machine":"Nouvelle machine"} onClose={()=>setShowMachineModal(false)}>
          <Input label="Nom / Désignation *" value={mForm.nom} onChange={e=>setMForm({...mForm,nom:e.target.value})} placeholder="ex: CAT 320D"/>
          <Select label="Type *" value={mForm.type} onChange={e=>setMForm({...mForm,type:e.target.value})}>
            {MACHINE_TYPES.map(t=><option key={t}>{t}</option>)}
          </Select>
          <Input label="Marque" value={mForm.marque} onChange={e=>setMForm({...mForm,marque:e.target.value})} placeholder="ex: Caterpillar"/>
          <Input label="Numéro de série" value={mForm.serie} onChange={e=>setMForm({...mForm,serie:e.target.value})}/>
          <Input label="Année" type="number" value={mForm.annee} onChange={e=>setMForm({...mForm,annee:e.target.value})}/>
          <Select label="Client associé" value={mForm.clientId} onChange={e=>setMForm({...mForm,clientId:e.target.value})}>
            <option value="">-- Aucun --</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn color="#6b7280" onClick={()=>setShowMachineModal(false)}>Annuler</Btn>
            <Btn onClick={saveMachine}>Enregistrer</Btn>
          </div>
        </Modal>
      )}

      {/* MODAL INTERVENTION */}
      {showIntervModal && (
        <Modal title={editInterv?"Modifier l'intervention":"Nouvelle intervention"} onClose={()=>setShowIntervModal(false)}>
          <Select label="Machine *" value={iForm.machineId} onChange={e=>setIForm({...iForm,machineId:e.target.value})}>
            <option value="">-- Sélectionner --</option>
            {machines.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}
          </Select>
          <Input label="Date *" type="date" value={iForm.date} onChange={e=>setIForm({...iForm,date:e.target.value})}/>
          <Select label="Type d'intervention" value={iForm.type} onChange={e=>setIForm({...iForm,type:e.target.value})}>
            {INTERVENTION_TYPES.map(t=><option key={t}>{t}</option>)}
          </Select>
          <Input label="Description" value={iForm.description} onChange={e=>setIForm({...iForm,description:e.target.value})} placeholder="Décrivez l'intervention"/>
          <Input label="Technicien" value={iForm.technicien} onChange={e=>setIForm({...iForm,technicien:e.target.value})}/>
          <Input label="Durée (heures)" type="number" value={iForm.duree} onChange={e=>setIForm({...iForm,duree:e.target.value})}/>
          <Input label="Coût (€)" type="number" value={iForm.cout} onChange={e=>setIForm({...iForm,cout:e.target.value})}/>
          <Input label="Type de panne" value={iForm.panne} onChange={e=>setIForm({...iForm,panne:e.target.value})} placeholder="ex: Hydraulique, Moteur, Transmission..."/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn color="#6b7280" onClick={()=>setShowIntervModal(false)}>Annuler</Btn>
            <Btn onClick={saveInterv}>Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
