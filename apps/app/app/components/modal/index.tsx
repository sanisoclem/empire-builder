import AccountModal from './account';
import BucketModal from './bucket';
import SwitcherModal from './switcher';
import TxnImportModal from './txn-import';

export default function Modals() {
  return (
    <>
      <SwitcherModal />
      <AccountModal />
      <BucketModal />
      <TxnImportModal />
    </>
  );
}
