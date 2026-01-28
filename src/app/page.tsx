"use client"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Monitor,
  Shield,
  Smartphone,
  Star,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { NavigationToolbar } from "./nav-menu"

const EmblaCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slides = [
    {
      title: "Streamline IT Operations",
      description:
        "Manage incidents, requests, and changes from a single, intuitive dashboard with powerful automation.",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
      features: [
        "24/7 Monitoring",
        "Automated Workflows",
        "Real-time Analytics",
      ],
    },
    {
      title: "Smart Ticket Management",
      description:
        "AI-powered ticket routing and intelligent prioritization for faster resolution times.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
      features: ["AI Classification", "Smart Routing", "SLA Management"],
    },
    {
      title: "Self-Service Portal",
      description:
        "Empower your users with an intuitive self-service portal and comprehensive knowledge base.",
      image:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop",
      features: ["Knowledge Base", "Request Forms", "Status Tracking"],
    },
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, isAutoPlaying])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  return (
    <Card className="relative w-full h-96 md:h-125 overflow-hidden border-0 p-0 shadow-2xl">
      <div
        className="relative w-full h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full shrink-0 relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/60 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-primary-foreground p-8">
                <div className="text-center max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-6 opacity-90">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {slide.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Get Started Today
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 p-0 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

const ITSMLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "IT Request Portal",
      description:
        "Submit and track IT requests with automated workflows and approval processes.",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Device Management",
      description:
        "Comprehensive device lifecycle management from procurement to retirement.",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Help Desk",
      description:
        "Round-the-clock support with intelligent ticket routing and escalation.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security & Compliance",
      description:
        "Maintain security standards and compliance with automated reporting.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Workflow Automation",
      description:
        "Streamline processes with intelligent automation and custom workflows.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description:
        "Enhanced collaboration tools for IT teams and stakeholders.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "IT Director",
      company: "TechCorp Solutions",
      content:
        "This ITSM platform transformed our IT operations. Response times improved by 60% and user satisfaction is at an all-time high.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CTO",
      company: "Innovation Labs",
      content:
        "The automation features saved us countless hours. The ROI was evident within the first quarter of implementation.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Manager",
      company: "Global Enterprises",
      content:
        "User-friendly interface and powerful features. Our team adopted it quickly with minimal training required.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavigationToolbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6">
              Next-Generation ITSM Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Your
              <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {" "}
                IT Operations
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Revolutionize your IT service management with intelligent
              automation, seamless workflows, and exceptional user experience.
              Designed for modern enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"/auth"}>
                <Button size="lg" className="text-lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          {/* Carousel */}
          <div className="mb-20">
            <EmblaCarousel />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Comprehensive Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete IT Service Management Suite
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to deliver exceptional IT services and support
              to your organization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="text-primary mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Customer Success
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by IT Leaders Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <div className="flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your IT Operations?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of organizations that have modernized their IT
            service management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg">
              <span className="flex items-center">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-linear-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="ml-2 text-lg font-bold">ITSM</span>
              </div>
              <p className="text-muted-foreground">
                The next-generation ITSM platform for modern enterprises.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Features
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Integrations
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    API
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Security
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Documentation
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Help Center
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Blog
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Community
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    About
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Careers
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Contact
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                  >
                    Privacy
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 ITSM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ITSMLandingPage
