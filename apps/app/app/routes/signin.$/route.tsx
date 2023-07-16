import { SignIn } from '@clerk/remix';
import { ROUTES } from '~/routes';

export default function SignInPage() {
  return (
    <div
      style={{
        backgroundImage: 'url(/bg.svg)',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
      className="flex h-screen w-screen items-center justify-center"
    >
      <SignIn routing={'path'} path={ROUTES.signin} />
    </div>
  );
}
