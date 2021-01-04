<template>
  <button
    :disabled="selectedScreen === 'inbox'"
    @click="selectScreen('inbox')"
  >
    Inbox
  </button>
  <button
    :disabled="selectedScreen === 'archived'"
    @click="selectScreen('archived')"
  >
    Archived
  </button>
  <bulk-action-bar :emails="filteredEmails" />
    <table class="mail-table">
    <tbody>
      <tr
        v-for="email in filteredEmails"
        :key="email.id"
        :class="['clickable', email.read ? 'read' :  '' ]"

      >
      <td>
        <input type="checkbox" @click="emailSelection.toggle(email)" :checked="emailSelection.emails.has(email)"/>
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
import axios from 'axios';
import { format } from 'date-fns';
import BulkActionBar from '@/components/BulkActionBar.vue';
import MailView from '@/components/MailView.vue';
import ModalView from '@/components/ModalView.vue';
import useEmailSelection from '@/composables/use-email-selection';
import { ref } from 'vue'

const viewOptions = {
  toggleRead({ email }) { email.read = !email.read; },
  toggleArchive: ({ email }) => email.archived = !email.archived,
  save: ({ email }, _this) => _this.updateEmail(email),
  closeModal: (none, _this) => _this.openedEmail = null,
  changeIndex: ({ val }, _this) => {
    const emails = _this.filteredEmails;
    const currentIndex = emails.indexOf(_this.openedEmail);
    const newEmail = emails[currentIndex + val];
    _this.openEmail(newEmail);
  },
};

export default {
  computed: {
    sortedEmails() {
      const { emails } = this
      return emails.sort((e1, e2) => (new Date(e1.sentAt) < new Date(e2.sentAt) ? 1 : -1));
    },
    filteredEmails() {
      if(this.selectedScreen === 'inbox') {
        return this.sortedEmails.filter((e) => !e.archived);
      } else {
        return this.sortedEmails.filter((e) => e.archived);
      }
    },
  },
  methods: {
    archiveEmail(email) {
      email.archived = true;
      this.updateEmail(email);
    },
    format,
    updateEmail(email) {
      return axios.put(`http://localhost:3000/emails/${email.id}`, email);
    },
    changeEmail(options) {
      const email = this.openedEmail;
      Object.keys(options).map((k) => {
        if (options[k]) {
          viewOptions[k]({ email, val: options[k] }, this);
        }
      });
    },
    openEmail(email) {
      this.openedEmail = email;
      if (email) {
        email.read = true;
        this.updateEmail(email);
      }
    },
    selectScreen(newScreen) {
      this.selectedScreen = newScreen
      this.emailSelection.clear()
    }
  },
  async setup() {
    const { data: emails } = await axios.get('http://localhost:3000/emails');

    return {
      emails: ref(emails),
      emailSelection: useEmailSelection(),
      openedEmail: ref(null),
      selectedScreen: ref('inbox')
    };
  },
  components: {
    BulkActionBar,
    MailView,
    ModalView,
  },
};
</script>
