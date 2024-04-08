import { ethers } from 'hardhat';

export const createSig = async function (
    types: string[],
    datas: any[],
    signer: any
) {
    const data = ethers.utils.solidityKeccak256(types, datas);
    return await signer.signMessage(ethers.utils.arrayify(data));
};

export const buf2hex = function (buffer: Uint8Array) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
};

export const hex2buf = function (hexString: string) {
    return new Uint8Array(Buffer.from(hexString, 'hex'));
};
