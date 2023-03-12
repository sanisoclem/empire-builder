import AccountModal from './account';
import BucketModal from './bucket';
import TxnImportModal from './txn-import';

export default function Modals() {
  return (
    <>
      <AccountModal />
      <BucketModal />
      <TxnImportModal />
    </>
  );
}
