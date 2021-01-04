import { reactive } from 'vue';
import axios from 'axios'

const emails = reactive(new Set());
export const useEmailSelection = () => {
  const toggle = (email) => {
    if (emails.has(email)) {
      emails.delete(email);
    } else {
      emails.add(email);
    }
  };
  const clear = () => {
    emails.clear()
  }

  const addMultiple = (newEmails) => {
    newEmails.forEach((email) => {
      emails.add(email)
    })
  }
  
  const forSelected = (fn) => {
    emails.forEach((email) => {
        fn(email);
        axios.put(`http://localhost:3000/emails/${email.id}`, email);
    })    
  }


  const archive = () => {
    forSelected(e => e.archived = true)
    clear()
  }

  const markRead = () => forSelected(e => e.read = true )
  
  const markUnread = () => forSelected(e => e.read = false )

  return {
    addMultiple,
    archive,
    clear,
    emails,
    markRead,
    markUnread,
    toggle,
  };
};

export default useEmailSelection;
