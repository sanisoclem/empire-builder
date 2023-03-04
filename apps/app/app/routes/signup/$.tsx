import { SignUp } from '@clerk/remix';
import { ROUTES } from '~/routes';

export default function SignUpPage() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-stone-300">
      <SignUp routing={'path'} path={ROUTES.signup} />
    </div>
  );
}
