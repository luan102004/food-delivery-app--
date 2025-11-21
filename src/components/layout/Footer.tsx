'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🍔</span>
              </div>
              <span className="text-xl font-bold text-white">
                {t('common.appName')}
              </span>
            </div>
            <p className="text-sm">
              Your favorite food delivery platform. Fast, reliable, and delicious meals at your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/customer/menu"
                  className="hover:text-primary-500 transition-colors"
                >
                  Browse Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/customer/orders"
                  className="hover:text-primary-500 transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurant"
                  className="hover:text-primary-500 transition-colors"
                >
                  For Restaurants
                </Link>
              </li>
              <li>
                <Link
                  href="/driver"
                  className="hover:text-primary-500 transition-colors"
                >
                  Become a Driver
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@foodhub.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Ho Chi Minh City, Vietnam</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                title="Facebook"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                title="Instagram"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                title="Twitter"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 FoodHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
