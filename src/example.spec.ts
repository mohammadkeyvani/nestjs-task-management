//feature

class FriendList {
  friends: string[] = [];

  addFriend(name: string) {
    this.friends.push(name);
    this.announceMembership(name);
  }

  announceMembership(name: string) {
    console.log(`memberShip is ${name}`);
  }

  removeFriend(name: string) {
    const index = this.friends.indexOf(name);

    if (index === -1) {
      throw new Error('Friend not found!');
    }
    this.friends.splice(index, 1);
  }
}

// tests

describe('FriendsList', () => {
  let friendList: FriendList;

  beforeEach(() => {
    friendList = new FriendList();
  });
  it('initialize friend list', () => {
    expect(friendList.friends.length).toEqual(0);
  });

  it('add friend to the list', () => {
    friendList.addFriend('mohammad');
    expect(friendList.friends.length).toEqual(1);
  });

  it('announce membership check', () => {
    friendList.announceMembership = jest.fn();
    expect(friendList.announceMembership).not.toHaveBeenCalled();
    friendList.addFriend('mohammad');
    expect(friendList.announceMembership).toHaveBeenCalled();
  });

  describe('removeFriend', () => {
    it('remove a friend from the list', () => {
      friendList.addFriend('mohammad');
      expect(friendList.friends[0]).toEqual('mohammad');
      friendList.removeFriend('mohammad');
      expect(friendList.friends[0]).toBeUndefined();
    });

    it('throws an error as friend does not exist', () => {
      expect(() => friendList.removeFriend('mohammad')).toThrow(
        new Error('Friend not found!'),
      );
    });
  });
});
