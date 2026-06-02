import Link from 'next/link'

const shopLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/products?category=performance', label: 'Performance' },
  { href: '/products?category=vitamins', label: 'Vitamins' },
  { href: '/products?category=beauty', label: 'Beauty' },
]

const supportLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/shipping', label: 'Shipping & Returns' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy Policy' },
]

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div>
            <h2 className="text-sm font-medium tracking-[0.2em] text-foreground uppercase">
              IRONROOTS
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Premium supplements rooted in science, crafted for those who demand more from their bodies.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-5">
              Newsletter
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Join for early access and exclusive offers.
            </p>
            <form action="#" className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-background border border-border rounded-none px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors rounded-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-16 pt-8 pb-4">
          <p className="text-xs text-muted-foreground/75">
            &copy; {new Date().getFullYear()} IRONROOTS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
