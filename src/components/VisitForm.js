import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabase';

const VisitForm = () => {
  const [mdnCode, setMdnCode] = useState('');
  const [pdvName, setPdvName] = useState(''); // 👈 Nuevo estado para el nombre del PDV
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

  // 📍 Obtener ubicación
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
        setLocationError('No pudimos obtener tu ubicación. Activa el GPS y permisos del navegador.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 🔎 Buscar PDV en tabla `tae` cuando se digite el MDN
  useEffect(() => {
    const fetchPDV = async () => {
      if (mdnCode.length === 8) {
        const { data, error } = await supabase
          .from('tae')
          .select('pdv')
          .eq('mdn', mdnCode)
          .limit(1);

        if (error) {
          console.error(error);
          setPdvName('');
        } else if (data && data.length > 0) {
          setPdvName(data[0].pdv);
        } else {
          setPdvName('No encontrado');
        }
      } else {
        setPdvName('');
      }
    };

    fetchPDV();
  }, [mdnCode]);

  // 🔗 Probar conexión
  const testConnection = async () => {
    setConnectionStatus(null);
    setError('');

    try {
      const { error } = await supabase
        .from('visitas_pdv')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setConnectionStatus(false);
        setError('Problema con la base de datos.');
      } else {
        setConnectionStatus(true);
      }
    } catch {
      setConnectionStatus(false);
      setError('No se puede conectar.');
    }
  };

  // 💾 Guardar visita
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mdnCode.length !== 8) {
      setError('El MDN debe contener exactamente 8 dígitos.');
      return;
    }

    if (!mdnCode.trim() || !route || !latitude || !longitude) {
      setError('¡Ey! Necesitas código del PDV, ruta y ubicación.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('visitas_pdv').insert([
      {
        agente_id: route,
        pdv_id: mdnCode.trim(),
        nombre_pdv: pdvName || null, // 👈 Se guarda el nombre del PDV
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
      setPdvName('');
      setRoute('');
      setHasChips(false);
      setChipsCount('');
      setLeftChips(false);
      setLeftChipsCount('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // ✅ Pantalla de éxito
  if (success) {
    return (
      <motion.div
        className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          ¡Visita guardada!
        </h2>
        <p className="text-center text-gray-600">
          Todo listo, agente estrella. ¿Otra visita?
        </p>
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
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Control de Visitas
      </h1>

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
        <RefreshCw className="w-5 h-5" />
        {connectionStatus === null
          ? 'Probar Conexión'
          : connectionStatus
          ? '¡Conexión OK!'
          : 'Conexión Falló'}
      </motion.button>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código MDN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código MDN del PDV
          </label>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {mdnCode && mdnCode.length !== 8 && (
            <p className="text-red-500 text-sm mt-2">
              El MDN contiene 8 dígitos
            </p>
          )}
          {pdvName && (
            <p className="text-blue-600 text-sm mt-2">
              PDV: {pdvName}
            </p>
          )}
        </div>

        {/* Resto del formulario (ruta, gps, chips, etc.) se mantiene igual */}
        {/* ... */}
      </form>
    </motion.div>
  );
};

export default VisitForm;
