import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Linkedin, Briefcase, Globe, User, Filter, ChevronDown, Edit3, Save, X, PlusCircle, AlertCircle, LogIn, LogOut, ShieldAlert, Phone, Wrench, CheckCircle2, Target, Info } from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB8-djhb18p0QlarWGqKX-OR8dQosAGIGw",
  authDomain: "la-fabrica-web-257e4.firebaseapp.com",
  projectId: "la-fabrica-web-257e4",
  storageBucket: "la-fabrica-web-257e4.firebasestorage.app",
  messagingSenderId: "300052172183",
  appId: "1:300052172183:web:3ec136c379a7659e1a88d2",
  measurementId: "G-V4N3P2QT3M"
};

const ADMIN_EMAIL = "ailen.heft@uap.edu.ar"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CATEGORIAS_AREAS = [
  "Comunicación institucional",
  "Producción audiovisual",
  "Redes sociales",
  "Redacción / storytelling",
  "Diseño gráfico",
  "Eventos",
  "Investigación",
  "Otros"
];

const TIPOS_ORGANIZACION = [
  "Medio de comunicación",
  "Agencia o consultora",
  "Empresa privada",
  "Iglesia o institución religiosa",
  "Freelancer",
  "No estoy seguro/a todavía",
  "Otros"
];

const ANIOS_CURSADA = ["1ro", "2do", "3ro", "4to", "Graduado/a"];

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scale-up" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-[#5253ed] transition-colors z-10 sticky-close">
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

const ContactCard = ({ estudiante, esMio, onEdit, onVerDetalle }) => (
  <div 
    onClick={onVerDetalle}
    className={`bg-white rounded-xl shadow-sm border cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-hidden ${estudiante.esDemo ? 'border-dashed border-slate-300 bg-slate-50' : esMio ? 'border-[#5253ed] ring-2 ring-[#b4c9fd]' : 'border-slate-200 hover:border-[#b4c9fd]'}`}
  >
    {estudiante.esDemo && <div className="absolute top-0 right-0 bg-[#dbff01] text-[#5253ed] text-[10px] px-2 py-1 font-bold z-20 rounded-bl-lg">MODO DEMO</div>}
    {esMio && <div className="absolute top-3 right-3 z-10"><span className="bg-[#5253ed] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md"><User size={12} /> Tu Perfil</span></div>}
    
    <div className="h-24 bg-gradient-to-r from-[#5253ed] to-[#b4c9fd] relative">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute -bottom-10 left-6">
        <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg relative">
          {estudiante.imagen ? (
            <img src={estudiante.imagen} alt={estudiante.nombre} className={`w-full h-full rounded-full object-cover ${estudiante.esDemo ? 'grayscale opacity-70' : ''}`} onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=IMG"}}/>
          ) : (
            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-[#b4c9fd]"><User size={40} /></div>
          )}
          {esMio && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }} 
              className="absolute bottom-0 right-0 bg-[#dbff01] hover:bg-[#c4e600] text-[#5253ed] p-1.5 rounded-full shadow-md transition-transform hover:scale-110 z-20" 
              title="Editar mi foto y datos"
            >
              <Edit3 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
    
    <div className="pt-12 px-6 pb-6 flex-grow flex flex-col">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#5253ed] transition-colors">{estudiante.nombre || "Estudiante Anónimo"}</h3>
        <p className="text-slate-500 text-xs mt-1 font-medium bg-slate-100 inline-block px-2 py-1 rounded">
          {estudiante.año ? `Cursando: ${estudiante.año}` : "Año no especificado"}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(estudiante.areas || []).map((area, index) => (
          <span key={index} className="bg-[#b4c9fd]/30 border border-[#b4c9fd]/50 text-[#5253ed] text-[10px] font-bold px-2 py-1 rounded-full">
            {area === "Otros" && estudiante.areasOtrosTexto ? `Otros: ${estudiante.areasOtrosTexto}` : area}
          </span>
        ))}
      </div>
      
      <div className="space-y-3 mb-6 flex-grow text-sm text-slate-600">
        {estudiante.herramientas && (
          <div>
            <span className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-1"><Wrench size={14} className="text-[#5253ed]"/> Herramientas:</span>
            <p className="leading-relaxed line-clamp-2">{estudiante.herramientas}</p>
          </div>
        )}
        
        {estudiante.experiencia === "Si" && estudiante.experienciaDetalle && (
          <div>
            <span className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-1"><CheckCircle2 size={14} className="text-[#5253ed]"/> Experiencia en:</span>
            <p className="leading-relaxed line-clamp-2">{estudiante.experienciaDetalle}</p>
          </div>
        )}

        {estudiante.tareasPreferidas && (
          <div>
            <span className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-1"><Target size={14} className="text-[#5253ed]"/> Tareas deseadas:</span>
            <p className="leading-relaxed line-clamp-2">{estudiante.tareasPreferidas}</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 mt-auto">
        <div className="flex gap-3 justify-start">
          {estudiante.email && <a href={`mailto:${estudiante.email}`} onClick={e => e.stopPropagation()} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#b4c9fd]/20 hover:text-[#5253ed] transition-colors" title="Email"><Mail size={18} /></a>}
          {estudiante.telefono && <a href={`https://wa.me/${estudiante.telefono.replace(/\D/g,'')}`} onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#b4c9fd]/20 hover:text-[#5253ed] transition-colors" title="Teléfono / WhatsApp"><Phone size={18} /></a>}
          {estudiante.linkedin && <a href={estudiante.linkedin} onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#b4c9fd]/20 hover:text-[#5253ed] transition-colors" title="LinkedIn"><Linkedin size={18} /></a>}
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [estudiantesReales, setEstudiantesReales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para modales
  const [mostrandoEditor, setMostrandoEditor] = useState(false);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [mostrandoQuienesSomos, setMostrandoQuienesSomos] = useState(false); // NUEVO ESTADO PARA QUIÉNES SOMOS
  
  const [guardando, setGuardando] = useState(false);
  const [modoAdminCarga, setModoAdminCarga] = useState(false);

  const [mostrandoAuth, setMostrandoAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authError, setAuthError] = useState("");

  const formularioVacio = { 
    nombre: "", 
    año: "1ro", 
    email: "", 
    telefono: "", 
    linkedin: "", 
    imagen: "",
    areas: [], 
    areasOtrosTexto: "", 
    experiencia: "No",
    experienciaDetalle: "",
    herramientas: "",
    tareasPreferidas: "",
    habilidades: "",
    areasDesarrollo: "",
    tipoOrganizacion: [], 
    tipoOrganizacionOtrosTexto: ""
  };
  const [formData, setFormData] = useState(formularioVacio);

  const manejarAuth = async (e) => {
    e.preventDefault();
    setAuthError("Conectando con Firebase..."); 
    
    const hiddenPassword = `F4bric4_${authEmail.toLowerCase()}`;
    
    try {
      await signInWithEmailAndPassword(auth, authEmail, hiddenPassword);
      setMostrandoAuth(false);
      setAuthEmail("");
      setAuthError("");
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, authEmail, hiddenPassword);
          setMostrandoAuth(false);
          setAuthEmail("");
          setAuthError("");
        } catch (regError) {
          if (regError.code === 'auth/email-already-in-use') {
             setAuthError("Este correo ya existe en la base. Bórralo en la consola de Firebase.");
          } else {
             setAuthError("Hubo un error al registrar: " + regError.code);
          }
        }
      } else {
         setAuthError("Error de Firebase: " + error.code);
      }
    }
  };

  const cerrarSesion = () => signOut(auth);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const profilesCollection = collection(db, 'estudiantes');
    const unsubscribeSnapshot = onSnapshot(profilesCollection, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEstudiantesReales(lista);
      setLoading(false);
    }, (error) => {
      console.error("Error al leer base de datos:", error);
      setLoading(false);
    });
    return () => unsubscribeSnapshot();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const miPerfil = user ? estudiantesReales.find(p => p.id === user.email) : null;

  const abrirMiEditor = () => {
    setModoAdminCarga(false);
    let dataPerfil = miPerfil ? { ...miPerfil } : null;
    if (dataPerfil && typeof dataPerfil.tipoOrganizacion === 'string') {
      dataPerfil.tipoOrganizacion = [dataPerfil.tipoOrganizacion];
    }
    setFormData(dataPerfil ? { ...formularioVacio, ...dataPerfil } : { ...formularioVacio, email: user.email });
    setMostrandoEditor(true);
  };

  const abrirEditorAdmin = () => {
    setModoAdminCarga(true);
    setFormData(formularioVacio);
    setMostrandoEditor(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Tamaño ideal para que la base de datos no se sature
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprime la imagen y la convierte a texto
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, imagen: dataUrl }));
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(file);
  };

  const handleCheckboxAreaChange = (area) => {
    setFormData(prev => {
      const areasActuales = prev.areas || [];
      if (areasActuales.includes(area)) {
        return { ...prev, areas: areasActuales.filter(a => a !== area) };
      } else {
        return { ...prev, areas: [...areasActuales, area] };
      }
    });
  };

  const handleCheckboxOrganizacionChange = (org) => {
    setFormData(prev => {
      let orgsActuales = prev.tipoOrganizacion || [];
      if (typeof orgsActuales === 'string') orgsActuales = [orgsActuales]; 
      
      if (orgsActuales.includes(org)) {
        return { ...prev, tipoOrganizacion: orgsActuales.filter(o => o !== org) };
      } else {
        return { ...prev, tipoOrganizacion: [...orgsActuales, org] };
      }
    });
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (modoAdminCarga && !formData.email) {
      alert("Para cargar a otra persona, es obligatorio ingresar su Email.");
      return;
    }

    if (formData.areas.length === 0) {
      alert("Por favor, selecciona al menos un área.");
      return;
    }

    if (!formData.tipoOrganizacion || formData.tipoOrganizacion.length === 0) {
      alert("Por favor, selecciona al menos un tipo de organización.");
      return;
    }

    setGuardando(true);
    try {
      const documentId = modoAdminCarga ? formData.email.toLowerCase() : user.email.toLowerCase();
      
      const docRef = doc(db, 'estudiantes', documentId);
      await setDoc(docRef, { 
        ...formData,
        email: documentId, 
        updatedAt: serverTimestamp(),
        creadoPorAdmin: modoAdminCarga 
      }, { merge: true });
      
      setMostrandoEditor(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar. Verifica tu conexión o los permisos de Firestore.");
    } finally {
      setGuardando(false);
    }
  };

  const estudiantesFiltrados = estudiantesReales.filter(est => {
    const coincideCategoria = filtroCategoria === "Todas" || (est.areas && est.areas.includes(filtroCategoria));
    const searchStr = `${est.nombre} ${est.herramientas} ${est.habilidades} ${est.tareasPreferidas}`.toLowerCase();
    const coincideBusqueda = searchStr.includes(busqueda.toLowerCase());
    
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-[#f8fafe] text-slate-800 relative pb-20 md:pb-0">
      
      {/* -------------------------------------------------------------------------------- */}
      {/* MAGIA DE LA TIPOGRAFÍA OUTFIT */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Outfit', sans-serif; }
      `}} />
      {/* -------------------------------------------------------------------------------- */}


      {/* HEADER: Fondo Azul Violeta */}
      <header className="bg-[#5253ed] text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          
          <div className="flex justify-end mb-6">
            {user ? (
              <div className="flex items-center gap-4 bg-white/10 py-2 px-4 rounded-full border border-white/20 text-sm backdrop-blur-sm">
                <span className="flex items-center gap-2">
                  <img src={`https://ui-avatars.com/api/?name=${user.email}&background=b4c9fd&color=5253ed`} alt="Avatar" className="w-6 h-6 rounded-full" />
                  {user.email} {isAdmin && <span className="bg-[#dbff01] text-[#5253ed] text-[10px] px-2 py-0.5 rounded font-bold uppercase">Admin</span>}
                </span>
                <button onClick={cerrarSesion} className="text-[#b4c9fd] hover:text-white transition-colors" title="Cerrar sesión"><LogOut size={16} /></button>
              </div>
            ) : (
              <button onClick={() => { setMostrandoAuth(true); setAuthError(""); }} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors border border-white/20 backdrop-blur-sm">
                <LogIn size={16} /> Ingresar
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                <img src="https://cdn-icons-png.flaticon.com/512/3061/3061341.png" className="w-10 h-10 filter invert opacity-90" alt="Logo" />
                LA FÁBRICA
              </h1>
              <p className="text-[#b4c9fd] mt-2 max-w-lg font-medium text-lg">Directorio de Perfiles de Comunicación. Encuentra el talento ideal.</p>
              
              {/* BOTÓN DE QUIÉNES SOMOS */}
              <button 
                onClick={() => setMostrandoQuienesSomos(true)} 
                className="mt-4 flex items-center justify-center md:justify-start gap-2 text-[#dbff01] hover:text-white font-bold transition-colors w-full md:w-auto"
              >
                <Info size={18} /> ¿Qué es La Fábrica?
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {user && (
                <button 
                  onClick={abrirMiEditor}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${
                    miPerfil ? "bg-white/10 hover:bg-white/20 text-white border border-white/20" : "bg-[#dbff01] hover:bg-[#c4e600] text-[#5253ed] hover:scale-105"
                  }`}
                >
                  {miPerfil ? <><User size={18} /> Editar Mi Perfil</> : <><PlusCircle size={18} /> Crear Mi Perfil</>}
                </button>
              )}
              
              {isAdmin && (
                <button onClick={abrirEditorAdmin} className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold bg-[#dbff01] hover:bg-[#c4e600] text-[#5253ed] shadow-lg transition-all">
                  <ShieldAlert size={18} /> Cargar datos de formulario
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5253ed]/50" size={18} />
              <input type="text" placeholder="Buscar por nombre, herramienta o habilidad..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] text-sm transition-all" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <div className="relative w-full md:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5253ed]/50" size={16} />
              <select className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] text-sm cursor-pointer transition-all" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="Todas">Todas las áreas</option>
                {CATEGORIAS_AREAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5253ed]/50 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20"><div className="w-12 h-12 border-4 border-[#b4c9fd] border-t-[#5253ed] rounded-full animate-spin mx-auto mb-4"></div><p className="text-slate-500 font-medium">Cargando directorio...</p></div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Perfiles Disponibles</h2>
              <span className="text-xs font-bold text-[#5253ed] bg-[#b4c9fd]/30 px-3 py-1 rounded-full border border-[#b4c9fd]/50">
                {estudiantesFiltrados.length} encontrados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {miPerfil && (filtroCategoria === "Todas" || (miPerfil.areas && miPerfil.areas.includes(filtroCategoria))) && (
                 (`${miPerfil.nombre} ${miPerfil.herramientas} ${miPerfil.tareasPreferidas}`).toLowerCase().includes(busqueda.toLowerCase())
              ) && (
                <div className="order-first">
                   <ContactCard 
                      estudiante={miPerfil} 
                      esMio={true} 
                      onEdit={abrirMiEditor} 
                      onVerDetalle={() => setPerfilSeleccionado(miPerfil)} 
                    />
                </div>
              )}

              {estudiantesFiltrados
                .filter(est => est.id !== user?.email)
                .map(estudiante => (
                <ContactCard 
                  key={estudiante.id} 
                  estudiante={estudiante} 
                  esMio={false} 
                  onVerDetalle={() => setPerfilSeleccionado(estudiante)} 
                />
              ))}
            </div>

            {estudiantesFiltrados.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#b4c9fd] shadow-sm">
                <div className="w-16 h-16 bg-[#b4c9fd]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#5253ed]">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No se encontraron resultados</h3>
                <p className="text-slate-500 mb-4">Intenta buscar con otros términos o cambia la categoría.</p>
                <button onClick={() => {setBusqueda(""); setFiltroCategoria("Todas")}} className="px-6 py-2 bg-[#5253ed] text-white font-bold rounded-lg hover:bg-[#4041d5] transition-colors shadow-md">
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* -------------------------------------------------------------------------------- */}
      {/* MODAL QUIÉNES SOMOS (NUEVA SECCIÓN INSTITUCIONAL) */}
      {/* -------------------------------------------------------------------------------- */}
      {mostrandoQuienesSomos && (
        <Modal onClose={() => setMostrandoQuienesSomos(false)}>
          <div className="p-0 overflow-hidden bg-slate-50">
            {/* Header del Modal */}
            <div className="bg-[#5253ed] p-8 md:p-10 text-white relative">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <h2 className="text-4xl font-black relative z-10 tracking-tight">LA FÁBRICA</h2>
               <p className="text-[#dbff01] font-bold text-xl relative z-10 uppercase tracking-widest mt-1">Lic. en Comunicación</p>
            </div>
            
            <div className="p-8 md:p-10 space-y-8">
               {/* Sección Qué es */}
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-[#dbff01]"></div>
                 <h3 className="text-[#5253ed] font-black text-2xl mb-3 flex items-center gap-2"><Target size={24}/> ¿Qué es?</h3>
                 <p className="text-slate-700 font-medium text-lg leading-relaxed">
                   Un espacio creado por estudiantes de Comunicación para estudiantes de Comunicación. Unifica proyectos, capacitaciones y eventos de la carrera en un mismo sistema de trabajo colaborativo e interanual.
                 </p>
               </div>
               
               {/* Grilla de info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-[#b4c9fd]/50 shadow-sm">
                   <h3 className="text-[#5253ed] font-black text-lg mb-2 uppercase">Objetivo</h3>
                   <p className="text-slate-600 font-medium">Consolidar un sistema de formación interna que articule práctica, liderazgo y comunidad para todos los años de la carrera.</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-[#b4c9fd]/50 shadow-sm">
                   <h3 className="text-[#5253ed] font-black text-lg mb-2 uppercase">Propuesta de Valor</h3>
                   <p className="text-slate-600 font-medium">Un espacio que brinda práctica real, aprendizaje continuo y construcción de identidad, formando comunicadores que saben hacer, coordinar y conectar.</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-[#b4c9fd]/50 shadow-sm">
                   <h3 className="text-[#5253ed] font-black text-lg mb-2 uppercase">Resuelve</h3>
                   <p className="text-slate-600 font-medium">Desarticulación de experiencias prácticas, falta de integración entre años y ausencia de formación interna continua.</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-[#b4c9fd]/50 shadow-sm">
                   <h3 className="text-[#5253ed] font-black text-lg mb-2 uppercase">Resultado Esperado</h3>
                   <p className="text-slate-600 font-medium">Mayor integración interanual, más proyectos concretos, fortalecimiento de la identidad de la carrera y continuidad institucional.</p>
                 </div>
               </div>

               {/* Valores y Público */}
               <div className="bg-[#f4f7ff] p-6 rounded-2xl border border-[#b4c9fd] shadow-sm">
                 <h3 className="text-[#5253ed] font-black text-xl mb-4">NUESTROS VALORES</h3>
                 <div className="flex flex-wrap gap-2 mb-6">
                   {['Colaboración', 'Creatividad', 'Aprendizaje continuo', 'Comunidad', 'Responsabilidad', 'Propósito'].map(v => (
                     <span key={v} className="bg-[#dbff01] text-[#5253ed] font-bold px-4 py-1.5 rounded-full text-sm shadow-sm uppercase tracking-wide">{v}</span>
                   ))}
                 </div>

                 <h3 className="text-[#5253ed] font-black text-xl mb-2">PÚBLICO OBJETIVO</h3>
                 <p className="text-slate-700 font-medium flex items-center gap-2">
                    <User size={18} className="text-[#5253ed]"/> Estudiantes de 1.º a 4.º año, docentes mentores y autoridades de la carrera.
                 </p>
               </div>
            </div>
          </div>
        </Modal>
      )}

      {/* -------------------------------------------------------------------------------- */}
      {/* MODAL DE PERFIL COMPLETO */}
      {perfilSeleccionado && (
        <Modal onClose={() => setPerfilSeleccionado(null)}>
          <div className="p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#5253ed] to-[#b4c9fd] h-32 w-full relative"></div>

            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-4 flex justify-between items-end">
                <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg flex-shrink-0 border-4 border-white">
                  {perfilSeleccionado.imagen ? (
                    <img src={perfilSeleccionado.imagen} alt={perfilSeleccionado.nombre} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-[#b4c9fd]">
                      <User size={64} />
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900">{perfilSeleccionado.nombre || "Sin Nombre"}</h2>
              <p className="text-[#5253ed] font-bold text-lg mt-1">
                {perfilSeleccionado.año ? `Cursando: ${perfilSeleccionado.año}` : "Estudiante"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {(perfilSeleccionado.areas || []).map((area, idx) => (
                  <span key={idx} className="bg-[#b4c9fd]/30 border border-[#b4c9fd]/50 text-[#5253ed] text-xs font-bold px-3 py-1 rounded-full">
                    {area === "Otros" && perfilSeleccionado.areasOtrosTexto ? `Otros: ${perfilSeleccionado.areasOtrosTexto}` : area}
                  </span>
                ))}
              </div>

              <hr className="my-6 border-[#b4c9fd]/30" />

              <div className="space-y-6">
                
                {perfilSeleccionado.tareasPreferidas && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Target size={16} className="text-[#5253ed]"/> Tareas que me interesan</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{perfilSeleccionado.tareasPreferidas}</p>
                  </div>
                )}

                {perfilSeleccionado.herramientas && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Wrench size={16} className="text-[#5253ed]"/> Herramientas que manejo</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{perfilSeleccionado.herramientas}</p>
                  </div>
                )}

                {perfilSeleccionado.habilidades && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 text-[#5253ed]">En lo que soy bueno/a</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{perfilSeleccionado.habilidades}</p>
                  </div>
                )}

                {perfilSeleccionado.areasDesarrollo && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 text-[#5253ed]">Me gustaría seguir desarrollando</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{perfilSeleccionado.areasDesarrollo}</p>
                  </div>
                )}

                {perfilSeleccionado.experiencia === "Si" && perfilSeleccionado.experienciaDetalle && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#5253ed]"/> Experiencia previa</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{perfilSeleccionado.experienciaDetalle}</p>
                  </div>
                )}

                {(perfilSeleccionado.tipoOrganizacion && perfilSeleccionado.tipoOrganizacion.length > 0) && (
                  <div className="bg-[#f4f7ff] p-4 rounded-xl border border-[#b4c9fd]/50 inline-block w-full">
                    <p className="text-sm text-[#5253ed] font-bold mb-2 uppercase">Me imagino trabajando en:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(perfilSeleccionado.tipoOrganizacion) 
                        ? perfilSeleccionado.tipoOrganizacion.map((org, idx) => (
                          <span key={idx} className="bg-white border border-[#b4c9fd] text-[#5253ed] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {org === "Otros" && perfilSeleccionado.tipoOrganizacionOtrosTexto ? `Otros: ${perfilSeleccionado.tipoOrganizacionOtrosTexto}` : org}
                          </span>
                        ))
                        : <span className="bg-white border border-[#b4c9fd] text-[#5253ed] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {perfilSeleccionado.tipoOrganizacion === "Otros" ? perfilSeleccionado.tipoOrganizacionOtrosTexto : perfilSeleccionado.tipoOrganizacion}
                          </span>
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de contacto */}
              <div className="bg-slate-50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border border-slate-200">
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Mail className="text-[#5253ed]" size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contacto</p>
                    <p className="text-slate-900 font-bold truncate">{perfilSeleccionado.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0 justify-end">
                  {perfilSeleccionado.telefono && (
                    <a href={`https://wa.me/${perfilSeleccionado.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#128C7E] transition-colors shadow-sm" title="Enviar WhatsApp">
                      <Phone size={18} />
                    </a>
                  )}
                  {perfilSeleccionado.linkedin && (
                    <a href={perfilSeleccionado.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-[#0a66c2] text-white font-bold rounded-lg hover:bg-[#084e96] transition-colors shadow-sm" title="Ver perfil de LinkedIn">
                      <Linkedin size={18} />
                    </a>
                  )}
                  <a href={`mailto:${perfilSeleccionado.email}`} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 bg-[#dbff01] text-[#5253ed] font-black rounded-lg hover:bg-[#c4e600] transition-colors shadow-sm uppercase tracking-wide">
                    Escribir Correo
                  </a>
                </div>
              </div>

            </div>
          </div>
        </Modal>
      )}


      {/* MODAL DE AUTENTICACIÓN */}
      {mostrandoAuth && (
        <Modal onClose={() => setMostrandoAuth(false)}>
          <div className="p-6">
            <h3 className="text-2xl font-black text-[#5253ed] mb-2 uppercase">Ingresar a La Fábrica</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Solo ingresa tu correo para crear o editar tu perfil.</p>

            <form onSubmit={manejarAuth} className="space-y-4">
              {authError && <div className="p-3 bg-red-50 text-red-600 font-bold text-sm rounded-lg border border-red-200">{authError}</div>}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                <input required type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="ejemplo@email.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none transition-all font-medium" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#5253ed] hover:bg-[#4041d5] text-[#dbff01] font-black rounded-lg shadow-md transition-all mt-4 uppercase tracking-wide">Continuar</button>
            </form>
          </div>
        </Modal>
      )}

      {/* MODAL / EDITOR DE PERFIL */}
      {mostrandoEditor && (
        <Modal onClose={() => setMostrandoEditor(false)}>
          <div className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className={`p-2 rounded-full ${modoAdminCarga ? 'bg-[#dbff01] text-[#5253ed]' : 'bg-[#5253ed] text-white'}`}>
                {modoAdminCarga ? <ShieldAlert size={24} /> : <User size={24} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{modoAdminCarga ? "Cargar ficha de tercero" : (miPerfil ? "Editar mi Ficha" : "Completar mi Perfil")}</h3>
                <p className="text-sm text-slate-500 font-medium">{modoAdminCarga ? "Estás ingresando las respuestas del Google Form." : "Queremos conocer cual es tu perfil como comunicador."}</p>
              </div>
            </div>

            <form onSubmit={guardarPerfil} className="space-y-6">
              
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="bg-[#f4f7ff] p-5 rounded-xl border border-[#b4c9fd]/50 space-y-4">
                <h4 className="font-black text-[#5253ed] border-b border-[#b4c9fd]/50 pb-2 uppercase tracking-wide">1. Datos Personales</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Nombre y Apellido <span className="text-red-500">*</span></label>
                    <input required name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none transition-all font-medium" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Año que estás cursando <span className="text-red-500">*</span></label>
                    <select required name="año" value={formData.año} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none transition-all font-medium">
                       {ANIOS_CURSADA.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input required={modoAdminCarga} disabled={!modoAdminCarga && miPerfil} name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none disabled:bg-slate-200 transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Teléfono (Opcional)</label>
                    <input name="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} placeholder="Ej: +54 9 11..." className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">LinkedIn (Si tenes)</label>
                <input name="linkedin" type="url" value={formData.linkedin} onChange={handleInputChange} placeholder="URL de LinkedIn" className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none transition-all font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Foto de Perfil</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {formData.imagen ? (
                      <img src={formData.imagen} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <User size={24} className="text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-white hover:bg-slate-50 text-[#5253ed] px-3 py-2 rounded-lg text-sm font-bold transition-colors border border-[#5253ed]/30 shadow-sm">
                    Subir Foto
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {formData.imagen && (
                    <button type="button" onClick={() => setFormData(prev => ({...prev, imagen: ""}))} className="text-red-500 hover:text-red-700 text-sm font-bold">
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PERFIL PROFESIONAL */}
              <div className="bg-[#f4f7ff] p-5 rounded-xl border border-[#b4c9fd]/50 space-y-6">
                <h4 className="font-black text-[#5253ed] border-b border-[#b4c9fd]/50 pb-2 uppercase tracking-wide">2. Tu Perfil como Comunicador</h4>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">¿En qué áreas te sentís más cómodo/a? (Elegí todas las que apliquen) <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {CATEGORIAS_AREAS.map(area => (
                      <label key={area} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-[#5253ed] transition-colors font-medium">
                        <input type="checkbox" checked={(formData.areas || []).includes(area)} onChange={() => handleCheckboxAreaChange(area)} className="w-4 h-4 accent-[#5253ed] rounded border-slate-300" />
                        {area}
                      </label>
                    ))}
                  </div>
                  {(formData.areas || []).includes("Otros") && (
                    <div className="mt-2 pl-2">
                      <input name="areasOtrosTexto" type="text" value={formData.areasOtrosTexto} onChange={handleInputChange} className="w-full p-2 border-b-2 border-slate-300 outline-none focus:border-[#5253ed] text-sm bg-transparent transition-colors font-medium" placeholder="Especifica qué otra área..." />
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4 bg-white border border-[#b4c9fd]/50 rounded-xl">
                  <label className="text-sm font-bold text-slate-700">¿Tenes experiencia comprobable en alguna de esas áreas? <span className="text-red-500">*</span></label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="radio" name="experiencia" value="Si" checked={formData.experiencia === "Si"} onChange={handleInputChange} className="w-4 h-4 accent-[#5253ed]"/> Sí</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="radio" name="experiencia" value="No" checked={formData.experiencia === "No"} onChange={handleInputChange} className="w-4 h-4 accent-[#5253ed]"/> No</label>
                  </div>
                  {formData.experiencia === "Si" && (
                    <div className="mt-3">
                      <label className="text-xs font-bold text-[#5253ed] uppercase">¿En qué?</label>
                      <input name="experienciaDetalle" type="text" value={formData.experienciaDetalle} onChange={handleInputChange} className="w-full p-2 border-b-2 border-slate-300 outline-none focus:border-[#5253ed] transition-colors bg-transparent font-medium" placeholder="Describe brevemente..." />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">¿Qué herramientas sabés usar? <span className="text-red-500">*</span></label>
                  <p className="text-xs text-slate-500 font-bold">Ejemplo: Premiere, Canva, WordPress, Excel, DaVinci, OBS, Meta Business...</p>
                  <textarea required name="herramientas" value={formData.herramientas} onChange={handleInputChange} rows="2" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none resize-none transition-all font-medium" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">¿Qué tipo de tareas te gustaría realizar? <span className="text-red-500">*</span></label>
                  <p className="text-xs text-slate-500 font-bold">Ej: grabar y editar video, redactar notas, hacer diseño...</p>
                  <textarea required name="tareasPreferidas" value={formData.tareasPreferidas} onChange={handleInputChange} rows="2" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none resize-none transition-all font-medium" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">¿En qué te considerás bueno/a?</label>
                    <textarea name="habilidades" value={formData.habilidades} onChange={handleInputChange} rows="2" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none resize-none transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">¿Qué te gustaría seguir desarrollando?</label>
                    <textarea name="areasDesarrollo" value={formData.areasDesarrollo} onChange={handleInputChange} rows="2" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5253ed] focus:border-[#5253ed] outline-none resize-none transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">¿En qué tipo de organización te imaginás trabajando? (Elegí todas las que apliquen) <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {TIPOS_ORGANIZACION.map(org => (
                      <label key={org} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-[#5253ed] transition-colors font-medium">
                        <input 
                          type="checkbox" 
                          checked={(formData.tipoOrganizacion || []).includes(org)} 
                          onChange={() => handleCheckboxOrganizacionChange(org)} 
                          className="w-4 h-4 accent-[#5253ed] rounded border-slate-300" 
                        />
                        {org}
                      </label>
                    ))}
                  </div>
                  {(formData.tipoOrganizacion || []).includes("Otros") && (
                    <div className="mt-2 pl-2">
                      <input required name="tipoOrganizacionOtrosTexto" type="text" value={formData.tipoOrganizacionOtrosTexto} onChange={handleInputChange} className="w-full p-2 border-b-2 border-slate-300 outline-none focus:border-[#5253ed] text-sm bg-transparent transition-colors font-medium" placeholder="Especifica qué tipo de organización..." />
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setMostrandoEditor(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors uppercase tracking-wide">Cancelar</button>
                <button type="submit" disabled={guardando} className={`px-8 py-2.5 text-[#5253ed] font-black rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 uppercase tracking-wide ${modoAdminCarga ? 'bg-[#dbff01] hover:bg-[#c4e600]' : 'bg-[#dbff01] hover:bg-[#c4e600]'}`}>
                  {guardando ? "Guardando..." : <><Save size={18} /> {modoAdminCarga ? "Guardar Datos" : "Guardar mi Perfil"}</>}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

    </div>
  );
}