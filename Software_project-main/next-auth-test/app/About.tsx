import React from 'react';
import './style.css';

const About: React.FC = () => {
  return (
    <div style={{ display: 'block', position: 'absolute', marginTop: '200px' }}>
      <div style={{ marginLeft: '20px', display: 'flex', height: '650px', marginTop: '70px' }} className='about-content'>
        <div style={{ marginTop: '10px', marginRight: '50px' }}>
          <h1 style={{ marginBottom: '20px' }}>About</h1>
          <h3 style={{ opacity: 0.5, marginBottom: '30px' }}>Delivery Route Optimization</h3>
          <p>
            The Route Optimization web application aims to solve the classic Traveling Salesman Problem (TSP) using efficient algorithms and modern web technologies.
            Whether you&apos;re a salesperson, a delivery driver, or a logistics manager, optimizing routes can significantly reduce costs, save time, and improve efficiency.
          </p>
          <img src="Paintdel.jpg" style={{ width: '350px', marginTop: '50px', marginLeft: '220px' }} alt="Delivery" className='about-image'/>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '500px' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126670.33644542085!2d79.77584973580089!3d7.18961141631247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2ee9c6bb2f73b%3A0xa51626e908186f3e!2sNegombo!5e0!3m2!1sen!2slk!4v1720568265441!5m2!1sen!2slk"
            allowFullScreen
            loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default About;
