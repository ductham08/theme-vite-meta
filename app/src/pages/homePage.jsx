import React from 'react'
import Navbar from '../components/Navbar';
import Main from '../components/Main';
import Banner from '../components/Banner';
import Card from '../components/Card';
import Testimonial from '../components/Testimonial';
import Blog from '../components/Blog';
import Footer from '../components/Footer';

const HomePage = () => {
    return (
        <>
            <Navbar />
            <Main />
            <Banner />
            <Card />
            <Testimonial />
            <Blog />
            <Footer />
        </>
    );
}

export default HomePage