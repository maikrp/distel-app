import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';  
import { supabase } from '../utils/supabase';  

const VisitForm = () => {  
  const [mdnCode, setMdnCode] = useState('');  
  const [nombrePdv, setNombrePdv] = useState(''); // 👈 Nuevo estado
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

  // Captura de GPS
  useEffect(() => {  
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
        setIsGettingLocation(false);  
      },  
      () => {  
        setLocationError('No pudimos agarrar tu ubicación. Activa el GPS.');  
        setIsGettingLocation(false);  
      },  
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }  
    );  
  }, []);  

  // Buscar nombre del PDV cuando se digita MDN
  useEffect(() => {  
    const fetchNombrePdv = async () => {  
      if (mdnCode.length === 8) {  
        const { data, error } = await supabase  
          .from('clientes')  
          .select('pdv')  
          .eq('mdn', mdnCode)  
          .limit(1)  
          .single();  

        if (!error && data) {  
          setNombrePdv(data.pdv);  
        } else {  
          setNombrePdv('No encontrado');  
        }  
      } else {  
        setNombrePdv('');  
      }  
    };  

    fetchNombrePdv();  
  }, [mdnCode]);  

  // Guardar visita
  const handleSubmit = async (e) => {  
    e.preventDefault();  

    if (mdnCode.length !== 8) {  
      setError('El MDN debe contener exactamente 8 dígitos.');  
      return;  
    }  
    if (!mdnCode.trim() || !route || !latitude || !longitude) {  
      setError('¡Ey! Necesitas código, ruta y ubicación primero.');  
      return;  
    }  

    setIsSubmitting(true);  
    setError('');  

    const { error: insertError } = await supabase.from('visitas_pdv').insert([  
      {  
        agente_id: route,  
        pdv_id: mdnCode.trim(),  
        nombre_pdv: nombrePdv || null, // 👈 Nuevo campo  
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
      setError('Ups, algo falló al guardar.');  
    } else {  
      setSuccess(true);  
      setMdnCode('');  
      setNombrePdv('');  
      setRoute('');  
      setHasChips(false);  
      setChipsCount('');  
      setLeftChips(false);  
      setLeftChipsCount('');  
      setTimeout(() => setSuccess(false), 3000);  
    }  
  };  

  return (  
    <motion.div className="bg-white rounded-3xl p-6 shadow-xl max-w-md mx-auto">  
      <h1 className="text-2xl font-bold text-center mb-6">Control de Visitas</h1>  

      <form onSubmit={handleSubmit} className="space-y-4">  
        {/* Código MDN */}  
        <div>  
          <label>Código MDN</label>  
          <input  
            type="text"  
            value={mdnCode}  
            onChange={(e) => {  
              if (/^\d{0,8}$/.test(e.target.value)) setMdnCode(e.target.value);  
            }}  
            placeholder="Ej: 88889999"  
            className="w-full px-4 py-2 border rounded"  
          />  
          {mdnCode && mdnCode.length !== 8 && (  
            <p className="text-red-500 text-sm">El MDN contiene 8 dígitos</p>  
          )}  
        </div>  

        {/* Nombre PDV */}  
        {nombrePdv && (  
          <div>  
            <label>Nombre del PDV</label>  
            <input  
              type="text"  
              value={nombrePdv}  
              readOnly  
              className="w-full px-4 py-2 border rounded bg-gray-100"  
            />  
          </div>  
        )}  

        {/* Ruta */}  
        <div>  
          <label>Ruta</label>  
          <select  
            value={route}  
            onChange={(e) => setRoute(e.target.value)}  
            className="w-full px-4 py-2 border rounded"  
          >  
            <option value="">Selecciona una ruta</option>  
            {routes.map((r) => (  
              <option key={r} value={r}>{r}</option>  
            ))}  
          </select>  
        </div>  

        {/* Chips */}  
        <div>  
          <label>¿El PDV tiene chips?</label>  
          <div>  
            <button type="button" onClick={() => setHasChips(false)}>No</button>  
            <button type="button" onClick={() => setHasChips(true)}>Sí</button>  
          </div>  
          {hasChips && (  
            <input  
              type="number"  
              value={chipsCount}  
              onChange={(e) => setChipsCount(e.target.value)}  
              placeholder="¿Cuántos?"  
              className="w-full px-4 py-2 border rounded mt-2"  
            />  
          )}  
        </div>  

        <div>  
          <label>¿Le dejamos chips?</label>  
          <div>  
            <button type="button" onClick={() => setLeftChips(false)}>No</button>  
            <button type="button" onClick={() => setLeftChips(true)}>Sí</button>  
          </div>  
          {leftChips && (  
            <input  
              type="number"  
              value={leftChipsCount}  
              onChange={(e) => setLeftChipsCount(e.target.value)}  
              placeholder="¿Cuántos?"  
              className="w-full px-4 py-2 border rounded mt-2"  
            />  
          )}  
        </div>  

        {error && <p className="text-red-500">{error}</p>}  

        <motion.button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white py-2 rounded">  
          {isSubmitting ? "Guardando..." : "Guardar Visita"}  
        </motion.button>  
      </form>  
    </motion.div>  
  );  
};  

export default VisitForm;  
