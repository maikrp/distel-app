import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { Plus, MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';  
import { supabase } from '../utils/supabase';  

const VisitForm = () => {  
  const [mdnCode, setMdnCode] = useState('');  
  const [route, setRoute] = useState('');  
  const [latitude, setLatitude] = useState(null);  
  const [longitude, setLongitude] = useState(null);  
  const [hasChips, setHasChips] = useState(false);  
  const [chipsCount, setChipsCount] = useState(0);  
  const [leftChips, setLeftChips] = useState(false);  
  const [leftChipsCount, setLeftChipsCount] = useState(0);  
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [success, setSuccess] = useState(false);  
  const [error, setError] = useState('');  
  const [locationError, setLocationError] = useState('');  
  const [isGettingLocation, setIsGettingLocation] = useState(true);  
  const [connectionStatus, setConnectionStatus] = useState(null); // null = no probado, true = ok, false = error  

  const routes = ['AJ01', 'AJ03', 'AJ07', 'AJ08', 'HD02', 'SJ02', 'SJ05', 'SJ16'];  

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
          setLocationError('');  
          setIsGettingLocation(false);  
        },  
        (err) => {  
          setLocationError('No pudimos agarrar tu ubicación. Activa el GPS y permisos del navegador.');  
          setIsGettingLocation(false);  
        },  
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }  
      );  
    };  

    getLocation();  
  }, []);  

  const testConnection = async () => {  
    setConnectionStatus(null); // Reset  
    setError('');  

    // Prueba de ubicación  
    if (!navigator.geolocation) {  
      setConnectionStatus(false);  
      setError('GPS no disponible. Revisa tu dispositivo.');  
      return;  
    }  

    navigator.geolocation.getCurrentPosition(  
      () => {  
        // Ubicación ok, ahora prueba el guardado  
        supabase  
          .from('visits')  
          .select('count', { count: 'exact', head: true })  
          .then(({ data, error }) => {  
            if (error) {  
              setConnectionStatus(false);  
              setError('Problema con el guardado de datos. Revisa tu conexión a internet y las credenciales.');  
            } else {  
              setConnectionStatus(true);  
              setError(''); // Limpia errores previos  
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
    if (!mdnCode.trim() || !route || !latitude || !longitude) {  
      setError('¡Ey! Necesitas código del PDV, ruta, y ubicación primero.');  
      return;  
    }  

    setIsSubmitting(true);  
    setError('');  

    const { data, error: insertError } = await supabase  
      .from('visits')  
      .insert([  
        {  
          mdn_code: mdnCode.trim(),  
          route,  
          latitude,  
          longitude,  
          has_chips: hasChips,  
          chips_count: parseInt(chipsCount) || 0,  
          left_chips: leftChips,  
          left_chips_count: parseInt(leftChipsCount) || 0,  
        },  
      ])  

    setIsSubmitting(false);  

    if (insertError) {  
      setError('Ups, algo falló al guardar. Revisa la conexión.');  
    } else {  
      setSuccess(true);  
      // Reset form  
      setMdnCode('');  
      setRoute('');  
      setHasChips(false);  
      setChipsCount(0);  
      setLeftChips(false);  
      setLeftChipsCount(0);  
      setTimeout(() => setSuccess(false), 3000);  
    }  
  };  

  if (success) {  
    return (  
      <motion.div  
        className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto"  
        initial={{ opacity: 0, scale: 0.9 }}  
        animate={{ opacity: 1, scale: 1 }}  
        transition={{ duration: 0.5 }}  
      >  
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />  
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">¡Visita guardada!</h2>  
        <p className="text-center text-gray-600">Todo listo, agente estrella. ¿Otra visita?</p>  
      </motion.div>  
    );  
  }  

  return (  
    <motion.div  
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl max-w-md mx-auto"  
      initial={{ opacity: 0, y: 20 }}  
      animate={{ opacity: 1, y: 0 }}  
      transition={{ duration: 0.5 }}  
    >  
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Control de Visitas</h1>  

      {/* Botón de prueba de conexión */}  
      <motion.button  
        onClick={testConnection}  
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all mb-4 ${  
          connectionStatus === null  
            ? 'bg-gray-500 text-white hover:bg-gray-600'  
            : connectionStatus  
            ? 'bg-green-500 text-white'  
            : 'bg-red-500 text-white'  
        }`}  
        whileHover={{ scale: 1.05 }}  
        whileTap={{ scale: 0.95 }}  
      >  
        <RefreshCw className={`w-5 h-5 ${connectionStatus !== null ? 'animate-spin' : ''}`} />  
        {connectionStatus === null ? 'Probar Conexión' :  
         connectionStatus ? '¡Conexión OK!' : 'Conexión Falló'}  
      </motion.button>  

      <form onSubmit={handleSubmit} className="space-y-4">  
        {/* Código MDN */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Código MDN del PDV</label>  
          <input  
            type="text"  
            value={mdnCode}  
            onChange={(e) => setMdnCode(e.target.value)}  
            placeholder="Ej: PDV123ABC"  
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
            required  
          />  
        </div>  

        {/* Ruta */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Ruta del PDV</label>  
          <select  
            value={route}  
            onChange={(e) => setRoute(e.target.value)}  
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"  
            required  
          >  
            <option value="">Selecciona una ruta</option>  
            {routes.map((ruta) => (  
              <option key={ruta} value={ruta}>  
                {ruta}  
              </option>  
            ))}  
          </select>  
        </div>  

        {/* Ubicación GPS - Automática */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación GPS (Automática)</label>  
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl">  
            <MapPin className="w-5 h-5" />  
            {isGettingLocation ? 'Capturando ubicación...' :  
             latitude && longitude ? `Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` :  
             'Error en GPS - Intenta recargar'}  
          </div>  
          {locationError && (  
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">  
              <AlertCircle className="w-4 h-4" /> {locationError}  
            </p>  
          )}  
        </div>  

        {/* Preguntas de Chips */}  
        <div className="space-y-4 pt-4 border-t border-gray-200">  
          {/* ¿El PDV tiene chips? */}  
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-3">¿El PDV tiene chips?</label>  
            <div className="flex gap-3 justify-center">  
              <motion.button  
                type="button"  
                onClick={() => setHasChips(false)}  
                className={`px-6 py-3 rounded-xl font-medium transition-all flex-1 ${  
                  !hasChips  
                    ? 'bg-blue-500 text-white shadow-lg'  
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'  
                }`}  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
              >  
                No  
              </motion.button>  
              <motion.button  
                type="button"  
                onClick={() => setHasChips(true)}  
                className={`px-6 py-3 rounded-xl font-medium transition-all flex-1 ${  
                  hasChips  
                    ? 'bg-green-500 text-white shadow-lg'  
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'  
                }`}  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
              >  
                Sí  
              </motion.button>  
            </div>  

            {hasChips && (  
              <div className="mt-3">  
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cuántos chips tiene?</label>  
                <input  
                  type="number"  
                  value={chipsCount}  
                  onChange={(e) => setChipsCount(e.target.value)}  
                  min="0"  
                  placeholder="Ej: 15"  
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"  
                />  
              </div>  
            )}  
          </div>  

          {/* ¿Le dejamos chips? */}  
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-3">¿Le dejamos chips?</label>  
            <div className="flex gap-3 justify-center">  
              <motion.button  
                type="button"  
                onClick={() => setLeftChips(false)}  
                className={`px-6 py-3 rounded-xl font-medium transition-all flex-1 ${  
                  !leftChips  
                    ? 'bg-blue-500 text-white shadow-lg'  
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'  
                }`}  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
              >  
                No  
              </motion.button>  
              <motion.button  
                type="button"  
                onClick={() => setLeftChips(true)}  
                className={`px-6 py-3 rounded-xl font-medium transition-all flex-1 ${  
                  leftChips  
                    ? 'bg-green-500 text-white shadow-lg'  
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'  
                }`}  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
              >  
                Sí  
              </motion.button>  
            </div>  

            {leftChips && (  
              <div className="mt-3">  
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cuántos chips le dejamos?</label>  
                <input  
                  type="number"  
                  value={leftChipsCount}  
                  onChange={(e) => setLeftChipsCount(e.target.value)}  
                  min="0"  
                  placeholder="Ej: 5"  
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"  
                />  
              </div>  
            )}  
          </div>  
        </div>  

        {error && (  
          <p className="text-red-500 text-sm flex items-center gap-1 p-3 bg-red-50 rounded-xl">  
            <AlertCircle className="w-4 h-4" /> {error}  
          </p>  
        )}  

        <motion.button  
          type="submit"  
          disabled={isSubmitting || !mdnCode.trim() || !route || !latitude || !longitude || isGettingLocation || connectionStatus === false}  
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"  
          whileHover={{ scale: 1.02 }}  
          whileTap={{ scale: 0.98 }}  
        >  
          {isSubmitting ? (  
            <>  
              <Clock className="w-5 h-5 animate-spin" /> Guardando...  
            </>  
          ) : (  
            <>  
              <Save className="w-5 h-5" /> Guardar Visita  
            </>  
          )}  
        </motion.button>  
      </form>  
    </motion.div>  
  );  
};  

export default VisitForm;