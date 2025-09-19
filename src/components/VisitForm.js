import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';  
import { supabase } from '../utils/supabase';  

const VisitForm = () => {  
  const [mdnCode, setMdnCode] = useState('');  
  const [pdvName, setPdvName] = useState(''); // 👈 Nuevo estado para guardar el nombre del PDV
  const [route, setRoute] = useState('');  
  const [latitude, setLatitude] = useState(null);  
  const [longitude, setLongitude] = useState(null);  
  const [accuracy, setAccuracy] = useState(null);  
  const [hasChips, setHasChips] = useState(false);  
  const [chipsCount, setChipsCount] = useState('');  
  const [leftChips, setLeftChips] = useState(false);  
  const [leftChipsCount, setLeftChipsCount] = useState('');  
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [success, setSuccess] = useState(false);  
  const [error, setError] = useState('');  
  const [locationError, setLocationError] = useState('');  
  const [isGettingLocation, setIsGettingLocation] = useState(true);  
  const [connectionStatus, setConnectionStatus] = useState(null);  

  const routes = ['AJ01', 'AJ03', 'AJ07', 'AJ08', 'HD02', 'SJ02', 'SJ05', 'SJ16'];  

  // 👇 Buscar el PDV en la tabla `tae` cuando cambie el MDN
  useEffect(() => {
    const fetchPdvName = async () => {
      if (mdnCode.length === 8) {
        const { data, error } = await supabase
          .from('tae')
          .select('pdv')
          .eq('mdn', mdnCode.trim())
          .limit(1);

        if (error) {
          console.error("Error buscando PDV:", error);
          setPdvName('');
        } else if (data && data.length > 0) {
          setPdvName(data[0].pdv);
        } else {
          setPdvName('');
        }
      } else {
        setPdvName('');
      }
    };

    fetchPdvName();
  }, [mdnCode]);

  useEffect(() => {  
    const getLocation = () => {  
      if (!navigator.geolocation) {  
        setLocationError('Tu navegador no soporta GPS. Usa un celular moderno.');  
        setIsGettingLocation(false);  
        return;  
      }  

      setLocationError('');  
      navigator.geolocation.getCurrentPosition(  
        (position) => {  
          setLatitude(position.coords.latitude);  
          setLongitude(position.coords.longitude);  
          setAccuracy(position.coords.accuracy);  
          setLocationError('');  
          setIsGettingLocation(false);  
        },  
        () => {  
          setLocationError('No pudimos agarrar tu ubicación. Activa el GPS y permisos del navegador.');  
          setIsGettingLocation(false);  
        },  
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }  
      );  
    };  

    getLocation();  
  }, []);  

  const testConnection = async () => {  
    setConnectionStatus(null);  
    setError('');  

    if (!navigator.geolocation) {  
      setConnectionStatus(false);  
      setError('GPS no disponible. Revisa tu dispositivo.');  
      return;  
    }  

    navigator.geolocation.getCurrentPosition(  
      () => {  
        supabase  
          .from('visitas_pdv')  
          .select('count', { count: 'exact', head: true })  
          .then(({ error }) => {  
            if (error) {  
              setConnectionStatus(false);  
              setError('Problema con el guardado de datos. Revisa tu conexión.');  
            } else {  
              setConnectionStatus(true);  
              setError('');  
            }  
          })  
          .catch(() => {  
            setConnectionStatus(false);  
            setError('No se puede conectar al guardado. Verifica internet.');  
          });  
      },  
      () => {  
        setConnectionStatus(false);  
        setError('GPS falló. Activa permisos y ubicación.');  
      }  
    );  
  };  

  const handleSubmit = async (e) => {  
    e.preventDefault();  

    if (mdnCode.length !== 8) {  
      setError('El MDN debe contener exactamente 8 dígitos.');  
      return;  
    }  

    if (!mdnCode.trim() || !route || !latitude || !longitude) {  
      setError('¡Ey! Necesitas código del PDV, ruta, y ubicación primero.');  
      return;  
    }  

    setIsSubmitting(true);  
    setError('');  

    const { error: insertError } = await supabase  
      .from('visitas_pdv')  
      .insert([  
        {  
          agente_id: route,  
          pdv_id: mdnCode.trim(),  
          nombre_pdv: pdvName || null, // 👈 Guardar el nombre del PDV si existe
          lat: latitude,  
          lng: longitude,  
          accuracy: accuracy,  
          tiene_chips: hasChips,  
          cantidad_chips: parseInt(chipsCount) || null,  
          se_entregaron: leftChips,  
          cantidad_entregada: parseInt(leftChipsCount) || null,  
        },  
      ]);  

    setIsSubmitting(false);  

    if (insertError) {  
      setError('Ups, algo falló al guardar. Revisa la conexión.');  
    } else {  
      setSuccess(true);  
      setMdnCode('');  
      setPdvName('');  
      setRoute('');  
      setHasChips(false);  
      setChipsCount('');  
      setLeftChips(false);  
      setLeftChipsCount('');  
      setTimeout(() => setSuccess(false), 3000);  
    }  
  };  

  if (success) {  
    return (  
      <motion.div className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto">  
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />  
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">¡Visita guardada!</h2>  
        <p className="text-center text-gray-600">Todo listo, agente estrella. ¿Otra visita?</p>  
      </motion.div>  
    );  
  }  

  return (  
    <motion.div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl max-w-md mx-auto">  
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Control de Visitas</h1>  

      <motion.button  
        onClick={testConnection}  
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium mb-4 ${  
          connectionStatus === null ? 'bg-gray-500 text-white' :  
          connectionStatus ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}  
      >  
        <RefreshCw className="w-5 h-5" />  
        {connectionStatus === null ? 'Probar Conexión' : connectionStatus ? '¡Conexión OK!' : 'Conexión Falló'}  
      </motion.button>  

      <form onSubmit={handleSubmit} className="space-y-4">  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Código MDN del PDV</label>  
          <input  
            type="text"  
            inputMode="numeric"  
            pattern="[0-9]{8}"  
            value={mdnCode}  
            onChange={(e) => {  
              const val = e.target.value;  
              if (/^\d{0,8}$/.test(val)) setMdnCode(val);  
            }}  
            placeholder="Ej: 88889999"  
            className="w-full px-4 py-3 border rounded-xl"  
            required  
          />  
          {mdnCode && mdnCode.length !== 8 && (  
            <p className="text-red-500 text-sm mt-2">El MDN contiene 8 dígitos</p>  
          )}  
        </div>  

        {/* Mostrar nombre del PDV si existe */}  
        {pdvName && (  
          <div className="p-3 bg-gray-100 rounded-xl text-gray-700">  
            <strong>PDV:</strong> {pdvName}  
          </div>  
        )}  

        {/* Ruta */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Ruta del PDV</label>  
          <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-white" required>  
            <option value="">Selecciona una ruta</option>  
            {routes.map((ruta) => (  
              <option key={ruta} value={ruta}>{ruta}</option>  
            ))}  
          </select>  
        </div>  

        {/* Ubicación GPS */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación GPS</label>  
          <div className="w-full px-4 py-3 bg-gray-100 rounded-xl">  
            <MapPin className="w-5 h-5 inline" />  
            {isGettingLocation ? 'Capturando ubicación...' : latitude && longitude ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'Error en GPS'}  
          </div>  
        </div>  

        {/* Preguntas de Chips (igual que antes) */}  
        <div className="space-y-4 pt-4 border-t border-gray-200">  
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-3">¿El PDV tiene chips?</label>  
            <div className="flex gap-3">  
              <motion.button type="button" onClick={() => setHasChips(false)} className={`flex-1 px-6 py-3 rounded-xl ${!hasChips ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>No</motion.button>  
              <motion.button type="button" onClick={() => setHasChips(true)} className={`flex-1 px-6 py-3 rounded-xl ${hasChips ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>Sí</motion.button>  
            </div>  
            {hasChips && (  
              <div className="mt-3">  
                <input type="number" value={chipsCount} onChange={(e) => setChipsCount(e.target.value)} placeholder="Ej: 15" className="w-full px-4 py-3 border rounded-xl" />  
              </div>  
            )}  
          </div>  

          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-3">¿Le dejamos chips?</label>  
            <div className="flex gap-3">  
              <motion.button type="button" onClick={() => setLeftChips(false)} className={`flex-1 px-6 py-3 rounded-xl ${!leftChips ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>No</motion.button>  
              <motion.button type="button" onClick={() => setLeftChips(true)} className={`flex-1 px-6 py-3 rounded-xl ${leftChips ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>Sí</motion.button>  
            </div>  
            {leftChips && (  
              <div className="mt-3">  
                <input type="number" value={leftChipsCount} onChange={(e) => setLeftChipsCount(e.target.value)} placeholder="Ej: 5" className="w-full px-4 py-3 border rounded-xl" />  
              </div>  
            )}  
          </div>  
        </div>  

        {error && <p className="text-red-500 text-sm">{error}</p>}  

        <motion.button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl">  
          {isSubmitting ? <><Clock className="w-5 h-5 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5" /> Guardar Visita</>}  
        </motion.button>  
      </form>  
    </motion.div>  
  );  
};  

export default VisitForm;  
