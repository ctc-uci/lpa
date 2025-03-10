import '../EditProgram.css';
import {EmailIcon} from '../../../assets/EmailIcon';

export const EmailDropdown = ({selectedPayees}) => {
  return (
    <div id="payeeEmails">
        <EmailIcon />
        {selectedPayees.map(payee => payee.email).join(", ")}
    </div>
  )
}
