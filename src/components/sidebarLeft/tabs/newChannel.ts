import appSidebarLeft, { AppSidebarLeft } from "..";
import { InputFile } from "../../../layer";
import appChatsManager from "../../../lib/appManagers/appChatsManager";
import Button from "../../button";
import InputField from "../../inputField";
import { SliderSuperTab } from "../../slider";
import AvatarEdit from "../../avatarEdit";

export default class AppNewChannelTab extends SliderSuperTab {
  private uploadAvatar: () => Promise<InputFile> = null;

  private channelNameInputField: InputField;
  private channelDescriptionInputField: InputField;
  private nextBtn: HTMLButtonElement;
  private avatarEdit: AvatarEdit;

  constructor(appSidebarLeft: AppSidebarLeft) {
    super(appSidebarLeft);
  }

  protected init() {
    this.container.classList.add('new-channel-container');
    this.title.innerText = 'New Channel';

    this.avatarEdit = new AvatarEdit((_upload) => {
      this.uploadAvatar = _upload;
    });

    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('input-wrapper');

    this.channelNameInputField = new InputField({
      label: 'Channel Name',
      maxLength: 128
    });

    this.channelDescriptionInputField = new InputField({
      label: 'Description (optional)',
      maxLength: 255
    });

    inputWrapper.append(this.channelNameInputField.container, this.channelDescriptionInputField.container);

    const onLengthChange = () => {
      this.nextBtn.classList.toggle('is-visible', !!this.channelNameInputField.value.length && 
        !this.channelNameInputField.input.classList.contains('error') && 
        !this.channelDescriptionInputField.input.classList.contains('error'));
    };

    this.channelNameInputField.input.addEventListener('input', onLengthChange);
    this.channelDescriptionInputField.input.addEventListener('input', onLengthChange);

    const caption = document.createElement('div');
    caption.classList.add('caption');
    caption.innerText = 'You can provide an optional description for your channel.';

    this.nextBtn = Button('btn-corner btn-circle', {icon: 'arrow_next'});

    this.nextBtn.addEventListener('click', () => {
      const title = this.channelNameInputField.value;
      const about = this.channelDescriptionInputField.value;

      this.nextBtn.disabled = true;
      appChatsManager.createChannel(title, about).then((channelId) => {
        if(this.uploadAvatar) {
          this.uploadAvatar().then((inputFile) => {
            appChatsManager.editPhoto(channelId, inputFile);
          });
        }
        
        appSidebarLeft.removeTabFromHistory(this.id);
        appSidebarLeft.addMembersTab.open({
          peerId: channelId,
          type: 'channel',
          skippable: true,
          title: 'Add Members',
          placeholder: 'Add People...',
          takeOut: (peerIds) => {
            return appChatsManager.inviteToChannel(Math.abs(channelId), peerIds);
          }
        });
      });
    });

    this.content.append(this.nextBtn);
    this.scrollable.append(this.avatarEdit.container, inputWrapper, caption);
  }

  public onCloseAfterTimeout() {
    this.avatarEdit.clear();
    this.uploadAvatar = null;
    this.channelNameInputField.value = '';
    this.channelDescriptionInputField.value = '';
    this.nextBtn.disabled = false;
  }
}