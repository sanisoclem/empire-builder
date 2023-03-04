import { SignIn } from '@clerk/remix';
import { ROUTES } from '~/routes';

export default function SignInPage() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-stone-300">
      <SignIn routing={'path'} path={ROUTES.signin} />
    </div>
  );
}
