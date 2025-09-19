import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';  
import { supabase } from '../utils/supabase';  

const VisitForm = () => {  
  const [mdnCode, setMdnCode] = useState('');  
  const [nombrePdv, setNombrePdv] = useState('');   // 👈 Nuevo estado
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

  // 👉 Cuando cambia el MDN, consultamos en clientes
  useEffect(() => {
    const fetchCliente = async () => {
      if (mdnCode.length === 8) {
        const { data, error } = await supabase
          .from('clientes')
          .select('pdv')
          .eq('mdn', mdnCode)   // 👈 Ajustar si tu columna MDN en clientes tiene otro nombre
          .limit(1);

        if (error) {
          console.error('Error al buscar cliente:', error);
          setNombrePdv('');
        } else if (data && data.length > 0) {
          setNombrePdv(data[0].pdv);
        } else {
          setNombrePdv('');
        }
      } else {
        setNombrePdv('');
      }
    };

    fetchCliente();
  }, [mdnCode]);

  // GPS
  useEffect(() => {  
    const getLocation = () => {  
      if (!navigator.geolocation) {  
        setLocationError('Tu navegador no soporta GPS. Usa un celular moderno.');  
        setIsGettingLocation(false);  
        return;  
      }  

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

  const handleSubmit = async (e) => {  
    e.preventDefault();  

    if (mdnCode.length !== 8) {  
      setError('El MDN debe contener exactamente 8 dígitos.');  
      return;  
    }  

    if (!mdnCode.trim() || !route || !latitude || !longitude) {  
      setError('¡Ey! Necesitas código del PDV, ruta y ubicación primero.');  
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
          nombre_pdv: nombrePdv || null,   // 👈 Nuevo campo insertado
          lat: latitude,  
          lng: longitude,  
          accuracy: accuracy,  
          tiene_chips: hasChips,  
          cantidad_chips: chipsCount ? parseInt(chipsCount) : null,  
          se_entregaron: leftChips,  
          cantidad_entregada: leftChipsCount ? parseInt(leftChipsCount) : null,  
        },  
      ]);  

    setIsSubmitting(false);  

    if (insertError) {  
      setError('Ups, algo falló al guardar. Revisa la conexión.');  
    } else {  
      setSuccess(true);  
      setMdnCode('');  
      setNombrePdv('');   // 👈 limpiar
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

      <form onSubmit={handleSubmit} className="space-y-4">  
        {/* Código MDN */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Código MDN del PDV</label>  
          <input  
            type="text"  
            inputMode="numeric"  
            pattern="[0-9]{8}"  
            value={mdnCode}  
            onChange={(e) => {  
              const val = e.target.value;  
              if (/^\d{0,8}$/.test(val)) {  
                setMdnCode(val);  
              }  
            }}  
            placeholder="Ej: 88889999"  
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"  
            required  
          />  
          {mdnCode && mdnCode.length !== 8 && (  
            <p className="text-red-500 text-sm mt-2">El MDN contiene 8 dígitos</p>  
          )}  
        </div>  

        {/* Nombre del PDV */}  
        {nombrePdv && (  
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del PDV</label>  
            <div className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-xl">  
              {nombrePdv}  
            </div>  
          </div>  
        )}  

        {/* Ruta */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Ruta del PDV</label>  
          <select  
            value={route}  
            onChange={(e) => setRoute(e.target.value)}  
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"  
            required  
          >  
            <option value="">Selecciona una ruta</option>  
            {routes.map((ruta) => (  
              <option key={ruta} value={ruta}>{ruta}</option>  
            ))}  
          </select>  
        </div>  

        {/* Aquí siguen las demás secciones (GPS, chips, etc.) sin cambios */}  

        {error && <p className="text-red-500 text-sm">{error}</p>}  

        <motion.button  
          type="submit"  
          disabled={isSubmitting}  
          className="w-full px-6 py-4 bg-green-600 text-white rounded-xl"  
        >  
          {isSubmitting ? <> <Clock className="w-5 h-5 animate-spin" /> Guardando... </> : <> <Save className="w-5 h-5" /> Guardar Visita </>}  
        </motion.button>  
      </form>  
    </motion.div>  
  );  
};  

export default VisitForm;  
