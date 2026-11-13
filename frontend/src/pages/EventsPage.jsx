import React from 'react'
import Header from '../components/Layout/Header'
import EventCard from '../components/Events/EventCard'
import Footer from '../components/Layout/Footer'
import { eventData } from "../static/data";

const EventsPage = () => {
  return (
    <div className="w-full">
        <Header activeHeading={4} />
        <div className="w-11/12 mx-auto py-10">
            <h1 className="text-[25px] font-[600] font-Roboto pb-5">Current Events</h1>
            {eventData.map((event) => (
                <EventCard key={event.id} active={true} data={event} />
            ))}
        </div>
        <Footer />
    </div>
  )
}

export default EventsPage;