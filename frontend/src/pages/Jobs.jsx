import React from 'react'
import JobTable from '../components/JobTable'

export default function Jobs() {
  return (
    <div>
      {/* Job Table Section */}
      <section id="jobs" className="py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Premium Opportunities</h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                Discover hand-curated, high-paying positions from top companies worldwide
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
              <JobTable />
            </div>
          </div>
        </section>
    </div>
  )
}
