import React from "react";
import FeedbackForm from '../components/FeedbackForm';
import { useContext } from 'react';

function Home({ isDark }) {
  return (
    <>
      <h1>Welcome to NextTalent</h1>
      <div className="mt-12">
        <FeedbackForm isDark={isDark} />
      </div>
    </>
  );
}

export default Home; 