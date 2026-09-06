/**
 * Stand-in for react-router-dom during render tests.
 *
 * Two reasons this exists rather than using the real package:
 *
 * 1. Under Vite's SSR loader the real package resolves as CommonJS and its
 *    named exports fail ("Named export 'Link' not found"). Marking it
 *    noExternal then trips ERR_AMBIGUOUS_MODULE_SYNTAX.
 * 2. Tests should exercise our components, not the router. A Link that renders
 *    a plain anchor is exactly enough to assert the href we built.
 *
 * Add to this only when a component under test needs something new.
 */
export function Link({ to, children, ...rest }) {
  return (
    <a href={typeof to === "string" ? to : "#"} {...rest}>
      {children}
    </a>
  );
}

export function NavLink({ to, children, className, ...rest }) {
  const resolved = typeof className === "function" ? className({ isActive: false }) : className;
  return (
    <a href={typeof to === "string" ? to : "#"} className={resolved} {...rest}>
      {typeof children === "function" ? children({ isActive: false }) : children}
    </a>
  );
}

export function MemoryRouter({ children }) {
  return children;
}

export const Outlet = () => null;
export const useParams = () => ({});
export const useNavigate = () => () => {};
export const useSearchParams = () => [new URLSearchParams(), () => {}];
