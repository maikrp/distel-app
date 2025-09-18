import React from 'react';  
import { motion } from 'framer-motion';  
import VisitForm from './components/VisitForm';  

export default function App() {  
  return (  
    <div className="min-h-screen flex items-center justify-center p-4">  
      <motion.div  
        initial={{ opacity: 0, y: 50 }}  
        animate={{ opacity: 1, y: 0 }}  
        transition={{ duration: 0.6 }}  
      >  
        <VisitForm />  
      </motion.div>  
    </div>  
  );  
}