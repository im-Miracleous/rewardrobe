import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardPathForRole, hashPassword, isWebsiteRegisterableRole, verifyPassword } from '../src/lib/auth';

test('hashPassword and verifyPassword work together', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);

    assert.notEqual(hashedPassword, password);
    assert.equal(await verifyPassword(password, hashedPassword), true);
    assert.equal(await verifyPassword('wrong-password', hashedPassword), false);
});

test('dashboard route maps to the correct role', () => {
    assert.equal(getDashboardPathForRole('admin'), '/dashboard/admin');
    assert.equal(getDashboardPathForRole('donatur'), '/dashboard/donatur');
    assert.equal(getDashboardPathForRole('penerima'), '/dashboard/penerima');
});

test('website registration rejects admin and allows only donatur/penerima', () => {
    assert.equal(isWebsiteRegisterableRole('admin'), false);
    assert.equal(isWebsiteRegisterableRole('donatur'), true);
    assert.equal(isWebsiteRegisterableRole('penerima'), true);
});