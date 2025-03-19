import React from 'react'

const SocialComponent = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-blue-800 mb-4">
                        Connect With Us On Social Media
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Join our community and stay updated with the latest news and updates
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Follow Us
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Stay connected with us on our social media platforms for real-time updates, news, and engaging content.
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li>• Facebook: Daily updates and community engagement</li>
                            <li>• Instagram: Visual stories and behind-the-scenes</li>
                            <li>• Twitter: Latest news and quick updates</li>
                            <li>• LinkedIn: Professional insights and company news</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Why Connect With Us?
                        </h2>
                        <ul className="space-y-3 text-gray-700">
                            <li>✓ Get exclusive content and updates</li>
                            <li>✓ Join a vibrant community</li>
                            <li>✓ Access to special offers and promotions</li>
                            <li>✓ Direct communication channel</li>
                            <li>✓ Stay informed about latest developments</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-500">
                        © 2024 All rights reserved. Follow us for more updates.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SocialComponent
