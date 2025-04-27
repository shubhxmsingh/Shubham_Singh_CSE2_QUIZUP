'use client';

import { motion } from 'framer-motion';
import { FloatingElements } from '@/components/home/FloatingElements';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      <FloatingElements />
      
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-50"
      >
        <Link 
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Contact Us
          </motion.h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Get in Touch</h2>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">shubham.sikarwar2005@gmail.com</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">+91 9350007614</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Ghaziabad, India</span>
                  </motion.div>
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Office Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border"
            >
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <Input 
                    type="text" 
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input 
                    type="email" 
                    placeholder="Your email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Message</label>
                  <Textarea 
                    placeholder="Your message"
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 