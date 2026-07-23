'use client';

import React, { useEffect, useState } from 'react';

// A simple global toast system
let showToastFn: (msg: string, isError?: boolean) => void = () => {};

export function toast(msg: string, isError: boolean = false) {
  showToastFn(msg, isError);
}

export default function ToastContainer() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    showToastFn = (msg: string, isError: boolean = false) => {
      setMessage(msg);
      setError(isError);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 2800);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="toast" style={{ display: 'block', background: error ? 'var(--red)' : 'var(--accent)' }}>
      {message}
    </div>
  );
}
