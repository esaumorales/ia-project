import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InterventionAlert({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-800">
              Intervención Aceptada 
            </h3>
            <p className="text-gray-600 mt-2 text-sm">
              Se ha registrado la intervención para este estudiante.  
              Puedes hacer seguimiento en la sección de reportes.
            </p>

            <button
              onClick={onClose}
              className="mt-5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
