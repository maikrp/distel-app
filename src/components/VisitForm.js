import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabase';

const VisitForm = () => {
  const [mdnCode, setMdnCode] = useState('');
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
  const [connectionStatus, setConnectionStatus] = useState(null); // null = no probado, true = ok, false = error

  // 👇 Nuevo estado para el nombre del PDV
  const [pdvName, setPdvName] = useState('');

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
          setAccuracy(position.coords.accuracy);
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

  // 👇 Nuevo efecto para consultar el nombre del PDV
  useEffect(() => {
    const fetchPdvName = async () => {
      if (mdnCode.length === 8) {
        const { data, error } = await supabase
          .from('tae')
          .select('pdv')
          .eq('mdn', mdnCode)
          .limit(1)
          .single();

        if (!error && data) {
          setPdvName(data.pdv);
        } else {
          setPdvName('');
        }
      } else {
        setPdvName('');
      }
    };

    fetchPdvName();
  }, [mdnCode]);

  const testConnection = async () => {
    setConnectionStatus(null); // Reset
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
              setError('Problema con el guardado de datos. Revisa tu conexión a internet y las credenciales.');
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
          nombre_pdv: pdvName || null, // 👈 Guardamos el nombre si existe
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
      setRoute('');
      setHasChips(false);
      setChipsCount('');
      setLeftChips(false);
      setLeftChipsCount('');
      setPdvName(''); // reset también
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
        {connectionStatus === null ? 'Probar Conexión' : connectionStatus ? '¡Conexión OK!' : 'Conexión Falló'}
      </motion.button>

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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {mdnCode && mdnCode.length !== 8 && (
            <p className="text-red-500 text-sm mt-2">El MDN contiene 8 dígitos</p>
          )}

          {/* 👇 Mostrar el nombre del PDV si existe */}
          {pdvName && (
            <p className="text-green-600 text-sm mt-2">PDV encontrado: {pdvName}</p>
          )}
        </div>

        {/* Aquí sigue TODO el resto del formulario original: rutas, GPS, chips, etc. */}
        {/* ... (sin tocar nada más) */}
      </form>
    </motion.div>
  );
};

export default VisitForm;
