import { Link } from 'wouter';

export default function Footer2() {
  return (
    <footer className="bg-[#131823] border-t border-[#595e65] py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold mb-4">NoteTrade</h3>
            <p className="text-sm text-gray-300 max-w-md">
              The premier marketplace for mortgage note investing. Connect with qualified buyers and sellers in a secure environment.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-300">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq"><a className="text-gray-400 hover:text-white">FAQ</a></Link></li>
                <li><Link href="/resources"><a className="text-gray-400 hover:text-white">Learning Center</a></Link></li>
                <li><Link href="/terms"><a className="text-gray-400 hover:text-white">Terms of Service</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-300">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace"><a className="text-gray-400 hover:text-white">Marketplace</a></Link></li>
                <li><Link href="/selling"><a className="text-gray-400 hover:text-white">Sell Notes</a></Link></li>
                <li><Link href="/buying"><a className="text-gray-400 hover:text-white">Buy Notes</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-300">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about"><a className="text-gray-400 hover:text-white">About Us</a></Link></li>
                <li><Link href="/contact"><a className="text-gray-400 hover:text-white">Contact</a></Link></li>
                <li><Link href="/privacy"><a className="text-gray-400 hover:text-white">Privacy Policy</a></Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#595e65] flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2025 NoteTrade. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}