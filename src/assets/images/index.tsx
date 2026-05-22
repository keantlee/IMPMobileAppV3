import logos from './logos';
import transaction from './transaction.jpg';
import accreditation from './accreditation.jpg';
import intervention from './interventions.jpg';
import receipt from './receipt.png';
// import sampleImages from './sampleImages';

const AppImages = {
    logos:          logos,
    transaction: transaction,
    accreditation:  accreditation,
    intervention:   intervention,
    receipt:        receipt
} as const;

export default AppImages;