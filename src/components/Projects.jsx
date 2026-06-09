import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projectsData, categories } from '../data/projects'
import { staggerContainer, fadeInUp, scaleIn } from '../utils/animations'
import { FiPlay, FiX } from 'react-icons/fi'

function ProjectPreview({ project }) {
  const videoRef = useRef(null)
  const playPreview = () => videoRef.current?.play().catch(() => {})
  const stopPreview = () => {
    if (!videoRef.current) return
    videoRef.current.pause()
    videoRef.current.currentTime = 0
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: project.accent }}
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
    >
      {project.videoUrl && (
        <video
          ref={videoRef}
          src={project.videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <div className="pointer-events-none absolute inset-0 purple-grid opacity-15" />
      <div className="pointer-events-none absolute left-6 right-6 top-6 h-4 rounded-full border border-white/15" />
      <div className="pointer-events-none absolute bottom-8 left-6 right-6 space-y-3">
        {[0, 1, 2].map((line) => (
          <div key={line} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/50" />
            <span className="h-2 flex-1 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)

  const filteredProjects =
    selectedCategory === 'All'
      ? projectsData
      : projectsData.filter((p) => p.category === selectedCategory)

  return (
    <section id="projects" className="relative py-20 md:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Title */}
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Featured Projects</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          {/* Category Filter */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-purple text-text shadow-glow-purple-lg'
                    : 'glass-effect text-text-muted hover:text-text border border-primary/20'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer"
                >
                  <div className="glass-effect rounded-xl overflow-hidden hover:border-primary/50 transition-all h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-48 md:h-56 bg-surface">
                      <div className="h-full w-full transition-transform duration-300 group-hover:scale-110">
                        <ProjectPreview project={project} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="bg-primary rounded-full p-4 shadow-glow-purple-lg"
                        >
                          <FiPlay className="text-2xl text-text" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-primary text-sm font-semibold mb-2">
                        {project.category}
                      </p>
                      <h3 className="text-lg font-bold text-text mb-2">
                        {project.title}
                      </h3>
                      <p className="text-text-muted text-sm mb-4">
                        {project.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Content */}
              <div className="aspect-video bg-surface relative">
                {selectedProject.videoUrl ? (
                  <video
                    src={selectedProject.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ProjectPreview project={selectedProject} />
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-4 top-4 rounded-lg border border-primary/30 bg-background/70 p-2 text-text hover:text-primary"
                  aria-label="Close project preview"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-8">
                <p className="text-primary text-sm font-semibold mb-2">
                  {selectedProject.category}
                </p>
                <h2 className="text-3xl font-bold mb-4">{selectedProject.title}</h2>
                <p className="text-text-muted mb-6">{selectedProject.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-4 py-2 bg-primary/20 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-3 bg-gradient-purple rounded-lg text-text font-semibold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
