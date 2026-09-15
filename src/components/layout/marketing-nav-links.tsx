import { HeaderNavLink } from './header-nav-link';

export function MarketingNavLinks() {
  return (
    <>
      <HeaderNavLink to="/" end>
        Home
      </HeaderNavLink>
      <HeaderNavLink to="/examples">Examples</HeaderNavLink>
    </>
  );
}
