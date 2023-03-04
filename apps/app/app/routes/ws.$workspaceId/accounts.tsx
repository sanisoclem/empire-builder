import { Button, PageHeader } from '~components';
import AccountList from '~components/account/account-list';
import { useModal } from '~hooks';

export default function Accounts() {
  const { newAccount } = useModal();
  const accounts = [
    {
      accountId: '123',
      name: 'NAB Transaction',
      type: 'Cash Account',
      denomination: 'AUD',
      balance: 33523.53,
      flow: 142.2
    },
    {
      accountId: '123',
      name: 'NAB CC',
      type: 'Credit Card',
      denomination: 'AUD',
      balance: -322.5,
      flow: -22.24
    },
    {
      accountId: '123',
      name: 'Stake ',
      type: 'Settlement Account',
      denomination: 'USD',
      balance: 12004.13,
      flow: 0
    }
  ];
  const handleCreateAccount = () => {
    newAccount();
  };
  return (
    <div className="self-stretch bg-white dark:bg-stone-800 w-full">
      <nav className="px-4 py-6 flex justify-between items-center">
        <PageHeader>Accounts</PageHeader>
        <Button onClick={handleCreateAccount}>New Account</Button>
      </nav>
      <div className="w-full overflow-x-auto">
        <div className="overflow-hidden shadow">
          <AccountList accounts={accounts} />
        </div>
      </div>
    </div>
  );
}
