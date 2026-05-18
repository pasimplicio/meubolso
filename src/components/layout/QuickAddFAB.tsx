import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import TransactionModal from '../transactions/TransactionModal';

export default function QuickAddFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        className="fab"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        aria-label="Nova transação"
        title="Nova transação"
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>
      <TransactionModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
