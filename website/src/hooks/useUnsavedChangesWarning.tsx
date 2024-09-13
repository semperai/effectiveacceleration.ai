import { useEffect, useState } from 'react';

const useUnsavedChangesWarning = (isConfirmed: boolean) => {
  const [canNavigate, setCanNavigate] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!canNavigate && !isConfirmed) {
        event.preventDefault();
        event.returnValue = '';
        alert('Please wait 5 seconds before navigating away.');
      }
    };

    const handleLinkClick = (event: MouseEvent) => {
      if (!canNavigate && !isConfirmed) {
        event.preventDefault();
        alert('Please wait 5 seconds before navigating away.');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    const timer = setTimeout(() => {
      setCanNavigate(true);
    }, 5000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.querySelectorAll('a').forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
      clearTimeout(timer);
    };
  }, [canNavigate, isConfirmed]);

  return canNavigate;
};

export default useUnsavedChangesWarning;