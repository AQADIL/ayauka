import '../styles/globals.css';
import { useEffect } from 'react';
import { Howl } from 'howler';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const sound = new Howl({
      src: ['https://cdn.pixabay.com/audio/2022/10/16/audio_12b7c8c2c6.mp3'], // красивая спокойная музыка
      loop: true,
      volume: 0.4,
    });
    sound.play();
    return () => sound.unload();
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
