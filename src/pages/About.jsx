function About() {
  function handleClick() {
    alert('¡Botón pulsado!');
  }

  return (
    <div>
      <h1>Acerca de</h1>
      <p>Esta es la página About.</p>
      <button onClick={handleClick}>Púlsame</button>
    </div>
  );
}

export default About;
