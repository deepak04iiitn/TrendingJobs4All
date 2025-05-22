import React from 'react';
import { Timeline } from 'flowbite-react';
import { HiCalendar } from 'react-icons/hi';
import { Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="relative flex flex-col items-center justify-center h-full text-blue-900 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-5xl font-bold">Discover Your Path</h1>
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-xl max-w-2xl text-center">
            Empowering careers, connecting dreams, and building futures together at TrendingJobs4All
          </p>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 pb-16">
        <Timeline className="w-full max-w-4xl mx-auto">
          {timelineItems.map((item, index) => (
            <Timeline.Item
              key={index}
              className="transition-transform transform hover:scale-105 duration-500 border-l-2 border-blue-600 pl-6 mb-10"
            >
              <Timeline.Point
                icon={HiCalendar}
                className="text-white bg-blue-600 rounded-full p-2 shadow-lg"
              />
              <Timeline.Content className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Timeline.Time className="text-gray-600 text-sm font-medium">
                  {item.time}
                </Timeline.Time>
                <Timeline.Title className="text-2xl font-semibold text-gray-900 mt-2 mb-4">
                  {item.title}
                </Timeline.Title>
                <Timeline.Body className="text-gray-700 text-base leading-relaxed space-y-3">
                  {item.body.map((point, i) => (
                    <p key={i} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">▸</span>
                      <span>{point}</span>
                    </p>
                  ))}
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </div>
  );
}

const timelineItems = [
  {
    time: "Our Mission",
    title: "Who Are We?",
    body: [
      "Discover top career opportunities with TrendingJobs4All! Our dedicated team connects talented professionals with the perfect job opportunities to help them thrive in their careers.",
      "Discover job roles and internships that perfectly match your skills, ambitions, and values on TrendingJobs4All, your ultimate platform for career opportunities.",
      "At TrendingJobs4All, we empower individuals by connecting them with the right job opportunities, ensuring every career step is meaningful and fulfilling.",
      "Experience innovation and seamless job searching with TrendingJobs4All—the ultimate platform for professionals and students to discover their next big career opportunity."
    ]
  },
  {
    time: "Our Approach",
    title: "What Makes Us Different from Others?",
    body: [
      "Discover a revolutionary job search experience with **TrendingJobs4All**, where personalized career recommendations help you find opportunities tailored just for you.",
      "At TrendingJobs4All, advanced algorithms match your unique skills, experiences, and aspirations with the best job and internship opportunities for your career growth.",
      "Enhance your career with TrendingJobs4All, offering tailored resources to help you upskill, build your network, and stay ahead of industry trends.",
      "At TrendingJobs4All, we prioritize community building, providing access to forums, mentorship, and expert career advice to support your professional growth.",
      "At TrendingJobs4All, it's not just about finding a job—it's about discovering the right career path that aligns with your goals and aspirations."
    ]
  },
  {
    time: "Our Promise",
    title: "Why Choose Us?",
    body: [
      "Choosing TrendingJobs4All means selecting a platform that truly understands your career goals. Enjoy a seamless, intuitive experience to explore and apply for job opportunities that align with your passion, skills, and aspirations.",
      "With TrendingJobs4All, you're not just a job seeker; you're part of a supportive community dedicated to your continuous growth, success, and career advancement.",
      "Our commitment to providing curated job opportunities, personalized insights, and professional development resources makes TrendingJobs4All the ultimate platform to advance your career. Join us today and take the first step toward a brighter, more fulfilling professional future!"
    ]
  }
];
