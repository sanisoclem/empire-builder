import { SignUp } from '@clerk/remix';
import { ROUTES } from '~/routes';

export default function SignUpPage() {
  return (
    <div
      style={{
        backgroundImage: 'url(/bg.svg)',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
      className="flex h-screen w-screen items-center justify-center"
    >
      <SignUp routing={'path'} path={ROUTES.signup} />
    </div>
  );
}
