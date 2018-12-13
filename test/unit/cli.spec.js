import {expect} from 'chai';

import {cli} from '../../src/cli';

describe('Cli', () => {

  describe("default arguments", () => {
    it("should default threshold to low", () => {
        expect(cli.flags.threshold).to.eql('critical');
    });

    it("should default ignoreDev to true", () => {
        expect(cli.flags.ignoreDev).to.eql(true);
    });

    it("should default json to false", () => {
      expect(cli.flags.json).to.eql(false);
    });

    it("should default the npm registry to https://registry.npmjs.org", () => {
      expect(cli.flags.registry).to.eql("https://registry.npmjs.org/")
    });
  });
});
