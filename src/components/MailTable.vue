<template>
      <table class="mail-table">
    <tbody>
      <tr 
        v-for="email in unarchivedEmails" 
        :key="email.id" 
        :class="['clickable', email.read ? 'read' :  '' ]"
        
      >
      <td> 
        <input type="checkbox"/>
      </td>
      <td @click="openEmail(email)" > {{email.from}}</td>
      <td @click="openEmail(email)" >
        <p>
          <strong>{{email.subject}} </strong>
        </p>
      </td>
      <td @click="openEmail(email)" > {{email.from}}</td>
      <td @click="openEmail(email)"  class="date">{{format(new Date(email.sentAt), 'MMM do yyyy' )}}</td>
       <td><button @click="archiveEmail(email)">Archive </button></td>
      </tr>
    </tbody>
  </table>
  <modal-view v-if="openedEmail" @closeModal="openedEmail = null">
    <mail-view  :email="openedEmail" @changeEmail="changeEmail" />
  </modal-view>
</template>

<script>
import axios from 'axios'
import { format } from 'date-fns'
import MailView from '@/components/MailView'
import ModalView from '@/components/ModalView'
const viewOptions = {
    toggleRead: ({email}) => email.read = !email.read,
    toggleArchive: ({email}) => email.archived = !email.archived,
    save: ({email}, _this) => _this.updateEmail(email),
    closeModal: (none, _this) => _this.openedEmail = null,
    changeIndex: ({ val }, _this) => {
        const emails = _this.unarchivedEmails
        const currentIndex = emails.indexOf(_this.openedEmail)
        console.log('current INdex >> ', currentIndex, val)
        const newEmail = emails[currentIndex + val]
        console.log('newEmail >> ', newEmail)
        _this.openEmail(newEmail)
    }
}

export default {
    computed: {
    sortedEmails() {
      return this.emails.sort((e1, e2) => {
        return new Date(e1.sentAt) < new Date(e2.sentAt) ? 1 : -1
      })
    },
    unarchivedEmails() {
      return this.sortedEmails.filter(e => !e.archived)
    }
  },
  methods: { 
    archiveEmail(email) {
        email.archived = true
        this.updateEmail(email)
    },
    format,
    updateEmail(email) {
        return  axios.put(`http://localhost:3000/emails/${email.id}`, email)    
    },
    changeEmail(options) {
        const email = this.openedEmail
        Object.keys(options).map(k => {
            if(options[k]) {
                viewOptions[k]({email, val: options[k]}, this)
            }
        })
    },
    openEmail(email) {
        this.openedEmail = email
        if (email) {
            email.read = true
            this.updateEmail(email)
        }
    },
   },
  async setup(){
    const {data:emails} = await axios.get('http://localhost:3000/emails')
    return {
      emails,
      openedEmail: null
    }
  },
  components: {
      MailView,
      ModalView
  }
}
</script>