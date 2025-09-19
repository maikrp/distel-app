import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, AlertCircle, Save, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabase';

const VisitForm = () => {
  const [mdnCode, setMdnCode] = useState('');
  const [pdvName, setPdvName] = useState(''); // 👈 nuevo estado para nombre PDV
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

  // 🚀 Captura de GPS
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

  // 🚀 Consulta automática del MDN en la tabla `tae`
  useEffect(() => {
    const fetchPdvName = async () => {
      if (mdnCode.length === 8) {
        const { data, error } = await supabase
          .from('tae')
          .select('pdv')
          .ilike('mdn', `%${mdnCode}%`) // 👈 ya garantizado como texto de 8 dígitos
          .limit(1)
          .single();

        if (error || !data) {
          setPdvName('No encontrado');
        } else {
          setPdvName(data.pdv);
        }
      } else {
        setPdvName('');
      }
    };

    fetchPdvName();
  }, [mdnCode]);

  const testConnection = async () => {
    setConnectionStatus(null);
    setError('');

    if (!navigator.geolocation) {
      setConnectionStatus(false);
      setError('GPS no disponible.');
      return;
    }

    supabase
      .from('visitas_pdv')
      .select('count', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) {
          setConnectionStatus(false);
          setError('Problema con el guardado de datos.');
        } else {
          setConnectionStatus(true);
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mdnCode.length !== 8) {
      setError('El MDN debe contener exactamente 8 dígitos.');
      return;
    }

    if (!mdnCode.trim() || !route || !latitude || !longitude) {
      setError('Faltan datos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('visitas_pdv').insert([
      {
        agente_id: route,
        pdv_id: mdnCode.trim(),
        nombre_pdv: pdvName, // 👈 nuevo campo
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
      setError('Error al guardar en la BD.');
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
      <motion.div
        className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">¡Visita guardada!</h2>
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
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium mb-4 ${
          connectionStatus === null
            ? 'bg-gray-500 text-white'
            : connectionStatus
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        <RefreshCw className="w-5 h-5" />
        {connectionStatus === null ? 'Probar Conexión' : connectionStatus ? '¡Conexión OK!' : 'Conexión Falló'}
      </motion.button>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* MDN */}
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
                setMdnCode(val.toString()); // 👈 guardamos como texto
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            required
          />
        </div>

        {/* Nombre PDV */}
        {pdvName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del PDV</label>
            <input
              type="text"
              value={pdvName}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100"
            />
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
              <option key={ruta} value={ruta}>
                {ruta}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación GPS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación GPS</label>
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl">
            <MapPin className="w-5 h-5" />
            {isGettingLocation
              ? 'Capturando ubicación...'
              : latitude && longitude
              ? `Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : 'Error en GPS'}
          </div>
          {locationError && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {locationError}
            </p>
          )}
        </div>

        {/* ¿El PDV tiene chips? */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">¿El PDV tiene chips?</label>
          <div className="flex gap-3 justify-center">
            <motion.button
              type="button"
              onClick={() => setHasChips(false)}
              className={`px-6 py-3 rounded-xl font-medium flex-1 ${
                !hasChips ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              No
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setHasChips(true)}
              className={`px-6 py-3 rounded-xl font-medium flex-1 ${
                hasChips ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
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
              className={`px-6 py-3 rounded-xl font-medium flex-1 ${
                !leftChips ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              No
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setLeftChips(true)}
              className={`px-6 py-3 rounded-xl font-medium flex-1 ${
                leftChips ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={
            isSubmitting ||
            !mdnCode.trim() ||
            !route ||
            !latitude ||
            !longitude ||
            isGettingLocation ||
            connectionStatus === false
          }
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold"
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